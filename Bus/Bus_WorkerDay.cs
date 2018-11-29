using SMS.DAL;
using SMS.DBHelper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace SMS.Bus
{
    public class Bus_WorkerDay
    {
        //取部门的考勤例外
        //取部门的考勤 (依单据录入)

        //添加例外
        //修改例外
        //删除例外

        //考勤天数
        public string GetWorkDaySqlWhere(DateTime S_jx_dd, DateTime E_jx_dd, string dep_no, string sal_no)
        {
            string sqlWhere = " {0}>= '" + S_jx_dd.ToShortDateString() + "'";
            sqlWhere += " and {0}<= '" + E_jx_dd.ToShortDateString() + "'";
            if (HideDataForCheck.HideDate.HasValue == true)
            {
                sqlWhere += " and {0} >= '" + HideDataForCheck.HideDate.Value + "'";
            }

            if (!string.IsNullOrEmpty(dep_no) && dep_no != "000000")
            {
                Bus.Bus_Dept busDept = new Bus_Dept();
                var dep_nos = busDept.GetDeptInfo(dep_no)["down_road"].ToString().Split(new char[] { ',' }).ToList();
                dep_nos.Add(dep_no);

                string depStringList = Bus.Common.BusComm.ListToSqlWhereIn(dep_nos);
                sqlWhere += " and {1} in (select user_no from Salm where dep_no in(" + depStringList + ") )";
            }

            if (!string.IsNullOrEmpty(sal_no))
            {
                sqlWhere += " and {1} ='" + sal_no + "'";
            }
            return sqlWhere;
        }


        public string CreateWorkDaySql(string sqlWhereFormat, string TempTable)
        {
            StringBuilder sql = new StringBuilder();
            sql.AppendLine(" select ");
            sql.AppendLine("    Case when ex.wd_id is null then T.worker else ex.worker end as worker, ");
            sql.AppendLine("    Case when ex.wd_id is null then T.wdate else ex.work_date end as wdate, ");
            sql.AppendLine("    Case when ex.wd_id is null then T.day_qty else ex.day_qty end as day_qty, ");
            sql.AppendLine("    Case when ex.wd_id is null then 'F' else 'T' end as is_exp ");
            sql.AppendLine(" into " + TempTable);  // #work_day

            sql.AppendLine("     from( ");
            sql.AppendLine("         select wdate, worker, 1 as day_qty from ViewWorkDay_JS where " + string.Format(sqlWhereFormat, "wdate", "worker"));// -- where worker = 'CC0005'
            sql.AppendLine("         union   ");
            sql.AppendLine("         select wdate, worker, 1 as day_qty from ViewWorkDay_JX where " + string.Format(sqlWhereFormat, "wdate", "worker")); //--  where worker = 'CC0005'
            sql.AppendLine(" ) AS T ");
            sql.AppendLine(" full join WorkerDayExp ex on ex.work_date = T.wdate and ex.worker = T.worker and " + string.Format(sqlWhereFormat, "ex.work_date", "ex.worker"));

            return sql.ToString();
        }


        public DataTable[] MonthData(DateTime S_jx_dd, DateTime E_jx_dd, string dep_no, string sal_no)
        {
            string workDaySqlWhere = GetWorkDaySqlWhere(S_jx_dd, E_jx_dd, dep_no, sal_no);
            string workDaySql = CreateWorkDaySql(workDaySqlWhere, "#work_day");
            string workDayExpSql = "select wd_id, work_date, worker, day_qty from WorkerDayExp where " + string.Format(workDaySqlWhere, "ex.work_date", "ex.worker");

            StringBuilder sql = new StringBuilder();

            sql.Append(workDaySql);

            sql.AppendLine("  select dep_no, worker, d, day_qty  ");
            sql.AppendLine("  into #w2  ");
            sql.AppendLine("  from( ");
            sql.AppendLine("      select W.*, S.dep_no, ");
            sql.AppendLine("         year(W.wdate) as y, ");
            sql.AppendLine("         'M' + Cast(MONTH(W.wdate) as varchar(2)) as m, ");
            sql.AppendLine("         'D' + Cast(day(W.wdate) as varchar(2)) as d ");
            sql.AppendLine("      from #WorkDay W ");
            sql.AppendLine("      LEFT JOIN Salm S on S.user_no = W.worker ");
            ///WHERE year(W.wdate) = 2015 and MONTH(W.wdate) = 2--AND S.dep_no = 'CC'
            sql.AppendLine(" )  as T ");
            sql.AppendLine(" ORDER BY dep_no, worker ");
            //----select* from #w2 
            //----order by worker
            sql.AppendLine(" select * from #w2  ");
            sql.AppendLine("      pivot(max(day_qty) for D in (D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15, D16, D17, D18, D19, D20, D21, D22, D23, D24, D25, D26, D27, D28, D29, D30, D31)) a ");

            DataTable dt1 = SqlHelper.ExecuteSql(sql.ToString());
            DataTable dtExp = SqlHelper.ExecuteSql(workDayExpSql);

            DataTable[] dtArr = new DataTable[2];
            dtArr[0] = dt1;
            dtArr[1] = dtExp;

            return dtArr;
        }

        
        /// <summary>
        /// 部门员工的考勤天数
        /// </summary>
        /// <param name="S_jx_dd"></param>
        /// <param name="E_jx_dd"></param>
        /// <param name="user_dep_no"></param>
        /// <returns></returns>
        public DataTable GetDeptWorkDay(DateTime S_jx_dd, DateTime E_jx_dd, string user_dep_no)
        {
            string workDaySqlWhere = GetWorkDaySqlWhere(S_jx_dd, E_jx_dd, user_dep_no, "");
            string workDaySql = CreateWorkDaySql(workDaySqlWhere, "#work_day");

            return SqlHelper.ExecuteSql(workDaySql);
        }



        public bool InsertExp(Dictionary<string, string> dayExp)
        {
            //wd_id int identity(1, 1),
            //work_date datetime not null,
            //worker varchar(40) not null,
            //day_qty decimal(18, 6),
            return SqlHelper.ExecuteTransWithCommand(new System.Data.SqlClient.SqlCommand(" Insert WorkerDayExp(work_date, worker, day_qty) values('" + dayExp["work_date"] + "','" + dayExp["worker"] + "'," + dayExp["day_qty"] + ")"));
        }

        public bool ModifyExp(Dictionary<string, string> dayExp)
        {
            return SqlHelper.ExecuteTransWithCommand(new System.Data.SqlClient.SqlCommand(" Update  WorkerDayExp set work_date = '" + dayExp["work_date"] + "', worker = '" + dayExp["worker"] + "', day_qty = " + dayExp["day_qty"] + " where wd_id=" + dayExp["wd_id"] + " "));
        }

        public bool DeleteExp(int exp_id)
        {
            return SqlHelper.ExecuteTransWithCommand(new System.Data.SqlClient.SqlCommand(" Delete  WorkerDayExp   where wd_id=" + exp_id.ToString() + " "));
        }



    }
}
