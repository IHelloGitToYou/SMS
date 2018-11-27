using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using SMS.Model;
using SMS.DAL;
using SMS.DBHelper;

namespace SMS.Bus
{
    public class Bus_YGGZ
    {
        private readonly Dal_YGGZ dal = new Dal_YGGZ();

        public DataTable GetData(string sqlWhere,string sqlWhereJs, string GetType)
        {
            return dal.GetData(sqlWhere,sqlWhereJs, GetType.ToUpper());
        }

        // 去掉worker_dep_no 因查询太慢，放在外局再查
        public string GetH2SearchWhere(DateTime S_jx_dd, DateTime E_jx_dd,  
                                        string worker, 
                                        string plan_no = "", 
                                        string prd_no ="",
                                        bool onlySheBao = false)
        {
            string sqlWhere = " and H.jx_dd>= '" + S_jx_dd + "'";
            sqlWhere += " and H.jx_dd<= '" + E_jx_dd + "'";

           
            if (!string.IsNullOrEmpty(worker)) {
                sqlWhere += " and (CASE WHEN B2S.worker is not null then B2S.worker else B.worker end)  = '" + worker + "'";
            }

            if (!string.IsNullOrEmpty(plan_no))
            {
                sqlWhere += " and H.plan_no like '%"+ plan_no.Trim() + "%' "; 
            }

            if (!string.IsNullOrEmpty(prd_no))
            {
                sqlWhere += " and H.prd_no = '" + prd_no + "' ";
            }

            if (onlySheBao == true)
            {
                sqlWhere += " and salm.is_shebao = 'true' ";
            }

            return sqlWhere;
        }

        public string GetHJS_SearchWhere(DateTime S_js_dd, DateTime E_js_dd, 
                                            string worker_dep_no, 
                                            string worker,
                                            bool onlySheBao = false)
        {
            string sqlWhere = " and H.js_dd>= '" + S_js_dd + "'";
            sqlWhere += " and H.js_dd<= '" + E_js_dd + "'";

            if (!string.IsNullOrEmpty(worker_dep_no) && worker_dep_no != "000000")
            {
                Bus.Bus_Dept busDept = new Bus_Dept();
                var dep_nos = busDept.GetDeptInfo(worker_dep_no)["down_road"].ToString().Split(new char[] { ',' }).ToList();
                dep_nos.Add(worker_dep_no);

                string depStringList = Bus.Common.BusComm.ListToSqlWhereIn(dep_nos);
                sqlWhere += " and Salm.dep_no in (" + depStringList + ")";
            }

            if (!string.IsNullOrEmpty(worker))
            {
                sqlWhere += " and B.sal_no= '" + worker + "'";
            }

            if (onlySheBao == true)
            {
                sqlWhere += " and salm.is_shebao = 'true' ";
            }

            return sqlWhere;
        }

        public StringBuilder GetBaseData(DateTime S_jx_dd, DateTime E_jx_dd, 
                                            string worker_dep_no, string worker, 
                                            string plan_no = "", string prd_no = "",
                                            bool onlySheBao = false)
        {
            string sqlWhere = GetH2SearchWhere(S_jx_dd, E_jx_dd, worker, plan_no: plan_no, prd_no: prd_no, onlySheBao:onlySheBao);
            string sqlJSWhere = GetHJS_SearchWhere(S_jx_dd, E_jx_dd, worker_dep_no, worker, onlySheBao:onlySheBao);
            string sqlWhere2 = "";
            if (!string.IsNullOrEmpty(worker_dep_no) && worker_dep_no != "000000")
            {
                Bus.Bus_Dept busDept = new Bus_Dept();
                var dep_nos = busDept.GetDeptInfo(worker_dep_no)["down_road"].ToString().Split(new char[] { ',' }).ToList();
                dep_nos.Add(worker_dep_no);
                string depStringList = Bus.Common.BusComm.ListToSqlWhereIn(dep_nos);
                sqlWhere2 = " and dep_no in (" + depStringList + ")";

                //绍庆 会快很多 --临时处理 12-29
                //sqlWhere2 += " and Salm.user_no in (select user_no from salm where dep_no in (" + depStringList + "))";
            }

            StringBuilder sql = new StringBuilder();

            sql.AppendLine(" select ");
            sql.AppendLine("    Salm.dep_no as dep_no, convert(varchar(100), H.js_dd, 111) as jx_dd, ");
            sql.AppendLine("    Salm.dep_no as worker_dep_no, B.sal_no as worker, B.js_no as plan_no, '计时' as prd_no, 0 as plan_all_qty_pair, ");
            sql.AppendLine("    0 as size_qty_pair, '' as size, '' as wp_no, B.rem as wp_name, 0 as plan_day_qty, 0 as day_qty_ut, ");
            sql.AppendLine("    B.qty as qty_pair, -1 as edit_ut, B.up as up_pair, B.amt as day_money, ");
            sql.AppendLine("    case when is_add = 'Y' then '有附加' else '' end as add_sign, ");
            sql.AppendLine("    0   as inscrease_percent, ");
            sql.AppendLine("    100 as share_percent,      ");
            sql.AppendLine("    0 as inscrease_money      ");
            sql.AppendLine("    into #DayDetail_onJS ");
            sql.AppendLine(" from JSQty_B B ");
            sql.AppendLine(" inner join JSQty_H H on H.js_no = B.js_no ");
            sql.AppendLine(" left join Salm on Salm.user_no = B.sal_no ");
            sql.AppendLine(" where  1 = 1 " + sqlJSWhere);

            sql.AppendLine(" select ");
            sql.AppendLine("     Salm.dep_no, convert(varchar(100), H.jx_dd, 111) as jx_dd , ");
            sql.AppendLine("     H.user_dep_no as worker_dep_no, " +
                           "       CASE WHEN B2S.worker is not null then B2S.worker else B.worker end worker, " +
                           "       H.plan_no, B.prd_no, P_H.sizes_qty as plan_all_qty_pair,  ");
            sql.AppendLine("     P_S.qty as size_qty_pair, P_S.size,    B.wp_no, WP.name as wp_name, P_D.day_qty as plan_day_qty, P_D.day_qty_ut,  ");
            //                                                                                分成*对数量*对单价=应发工资
            sql.AppendLine("     B.qty_pair, 1 as edit_ut, B.up_pair, ");
            sql.AppendLine("           ((Case when B2S.worker is not null then  " +
                                            "(case when isnull(B2S.share_percent,100) = 0 then 1 else isnull(B2S.share_percent,100)/ 100 end)  else 1 end) " +
                                            " * isnull(B.qty_pair, 0) * isnull(B.up_pair, 0)" +
                                        ") as day_money, ");
            ///11.24加入 附加类型
            sql.Append("        case   ");
            sql.Append("            when (WP.is_cutWp ='true' and Salm.type <> 5)  then '车位剪线'	 ");    //--1.车位剪线
            sql.Append("            when (WP.is_cutWp = 'false' and Salm.type = 5) then '杂工车位'  ");	        //--2.杂工车位
            sql.Append("            when (WP.is_psWp = 'true' ) then '拼身'                         ");	//--3.拼身
            sql.Append("            else ''										            ");      //--0.普通工资
            sql.Append("        end add_sign,                                               ");
            sql.Append("        isnull(B.inscrease_percent, 0) as inscrease_percent,         ");
            sql.Append("        Case when B2S.worker is not null then B2S.share_percent else 100 end as share_percent ");
            sql.AppendLine("    into #BT ");
            sql.AppendLine(" from WPQty_B2 B ");
            sql.AppendLine("     inner join WPQty_H2 H    on B.wq_id = H.wq_id ");
            sql.AppendLine("     left join  WPQty_B2_Share B2S  on B2S.wqb_id = B.wqb_id ");
            sql.AppendLine("     inner join WorkPlan P_H  on P_H.plan_id = H.plan_id ");
            sql.AppendLine("     inner join Prdt_WP WP   on WP.prd_no = B.prd_no and WP.wp_no = B.wp_no ");
            sql.AppendLine("     inner join WorkPlan_Sizes P_S  on P_S.plan_id = P_H.plan_id and P_S.size_id = B.size_id ");
            sql.AppendLine("     left join WorkPlan_DeptWP P_D  on P_D.plan_id = P_H.plan_id and P_D.wp_dep_no = WP.dep_no ");
            sql.AppendLine("     left join Salm on Salm.user_no = (CASE WHEN B2S.worker is not null then B2S.worker else B.worker end)  ");
            sql.AppendLine("     where  1=1  " + sqlWhere);


            sql.AppendLine("select ");
            sql.AppendLine("    *, case when inscrease_percent = 0 then 0 else day_money * (inscrease_percent / 100)end as inscrease_money ");
            sql.AppendLine("   into #DayDetail_onWP ");
            sql.AppendLine("from #BT ");
           
            sql.AppendLine("where  1=1 " + sqlWhere2);
            return sql;
        }

        public DataTable GetDayMoney_InH2(DateTime S_jx_dd, DateTime E_jx_dd, bool onlySum, string worker_dep_no, string worker, string plan_no = "", string prd_no = "")
        {
            StringBuilder sql = GetBaseData(S_jx_dd, E_jx_dd, worker_dep_no, worker, plan_no: plan_no, prd_no: prd_no);
            //H.jx_dd >= CONVERT(varchar(100), GETDATE(), 23) and H.jx_dd <= CONVERT(varchar(100), GETDATE(), 23)
            // --and H.user_dep_no = ''
            sql.AppendLine("            select 2 as row_sort, '' as dep_no, jx_dd, worker_dep_no, worker, '' as plan_no, '' as prd_no, 0 as plan_all_qty_pair, ");
            sql.AppendLine("                0 as size_qty_pair, '' as size, '' as wp_no, '' as wp_name, 0 as plan_day_qty, 0 as day_qty_ut, ");
            sql.AppendLine("                0 as qty_pair, 0 as edit_ut, 0 as up_pair, sum(day_money) as day_money, '' as add_sign, ");
            sql.AppendLine("                0 as inscrease_percent, 0 as share_percent, sum(inscrease_money) as inscrease_money ");
            sql.AppendLine("             Into #DaySum_L1 ");
            sql.AppendLine("             from ( ");
            sql.AppendLine("                select 1 as row_sort, * from #DayDetail_onWP ");
            sql.AppendLine("                union all    ");
            sql.AppendLine("                select 1 as row_sort, * from #DayDetail_onJS ");
            sql.AppendLine("             ) AS T          ");
            sql.AppendLine("             group by jx_dd, worker_dep_no, worker ");

            sql.AppendLine("            select 3 as row_sort, '' as dep_no, '1900-01-01' as jx_dd, '' as worker_dep_no, '' as worker, '' as plan_no, '' as prd_no, 0 as plan_all_qty_pair, ");
            sql.AppendLine("                0 as size_qty_pair, '' as size, '' as wp_no, '' as wp_name, 0 as plan_day_qty, 0 as day_qty_ut, ");
            sql.AppendLine("                0 as qty_pair, 0 as edit_ut, 0 as up_pair, sum(day_money) as day_money, '' as add_sign, ");
            sql.AppendLine("                0 as inscrease_percent, 0 as share_percent,sum(inscrease_money) as inscrease_money  ");
            sql.AppendLine("             Into #DaySum_L2 ");
            sql.AppendLine("             from #DaySum_L1 ");
             

            sql.AppendLine("     select ");
            sql.AppendLine("        row_sort2, row_sort, convert(varchar(100), jx_dd, 111) as jx_dd, worker_dep_no, worker,plan_no, prd_no, plan_all_qty_pair, ");
            sql.AppendLine("        size_qty_pair,size, wp_no,wp_name,plan_day_qty,day_qty_ut, ");
            sql.AppendLine("        qty_pair, edit_ut,up_pair,day_money, add_sign, ");
            sql.AppendLine("        inscrease_percent, share_percent, inscrease_money ");
            sql.AppendLine("      from ( ");
            sql.AppendLine("                select 1 as row_sort2, 1 as row_sort, * from #DayDetail_onWP " + (onlySum == true ? " where 1<> 1" : ""));
            sql.AppendLine("             union all    ");
            sql.AppendLine("                select 1 as row_sort2, 1 as row_sort, * from #DayDetail_onJS " + (onlySum == true ? " where 1<> 1" : ""));
            sql.AppendLine("             union all ");
            sql.AppendLine("                select 1 as row_sort2, * from #DaySum_L1");
            sql.AppendLine("             union all ");
            sql.AppendLine("                select 2 as row_sort2, * from #DaySum_L2");
            sql.AppendLine("      ) as T ");
            sql.AppendLine("     order by row_sort2, jx_dd, worker_dep_no, worker, row_sort ");

            return SqlHelper.ExecuteSql(sql.ToString());
        }


        public DataTable GetSumDayMoney_InH2(DateTime S_jx_dd, DateTime E_jx_dd, bool onlySumDept, string worker_dep_no, string worker)
        {
            Bus_WorkerDay busWorkerDqy = new Bus_WorkerDay();
            string workDaySqlWhere = busWorkerDqy.GetWorkDaySqlWhere(S_jx_dd, E_jx_dd, worker_dep_no, worker);
            string workDaySql = busWorkerDqy.CreateWorkDaySql(workDaySqlWhere, "#work_day" );

            string sqlWhereNow = " and 1=1";
            if (!string.IsNullOrEmpty(worker))
            {
                sqlWhereNow += " and {0} ='" + worker + "'";
            }

            if (!string.IsNullOrEmpty(worker_dep_no) && worker_dep_no != "000000")
            {
                Bus.Bus_Dept busDept = new Bus_Dept();
                var dep_nos = busDept.GetDeptInfo(worker_dep_no)["down_road"].ToString().Split(new char[] { ',' }).ToList();
                dep_nos.Add(worker_dep_no);

                string depStringList = Bus.Common.BusComm.ListToSqlWhereIn(dep_nos);
                sqlWhereNow += " and {0} in (select user_no from Salm where dep_no in(" + depStringList + ") )";
            }


            StringBuilder sql = new StringBuilder();
            sql.AppendLine(workDaySql);
            sql.AppendLine("  ");
            sql.AppendLine(" select ");
            sql.AppendLine("    *, ");
            sql.AppendLine("    (range_money / work_day) as day_money, ");
            sql.AppendLine("    ((range_money + inscrease_range_money) / work_day) as day_money2 ");
            sql.AppendLine(" into #TA  ");
            sql.AppendLine(" from ( ");
            sql.AppendLine("     select ");
            sql.AppendLine("         S.dep_no as worker_dep_no, ");
            sql.AppendLine("         T.*, ");   
            //                                      加 上班天数
            sql.AppendLine("         (select sum(day_qty) from #work_day D where D.worker = T.worker AND D.wdate >=  '"+ S_jx_dd.ToShortDateString() + "' and D.wdate <= '" + E_jx_dd.ToShortDateString() + "') AS work_day ");
            sql.AppendLine("      from ( ");
            //范围总工资
            //sql.AppendLine("          select  worker, sum(qty_pair * up_pair) as range_money from WPQty_B2 ");
            //sql.AppendLine("            where jx_dd >= '" + S_jx_dd.ToShortDateString() + "' and jx_dd <= '" + E_jx_dd.ToShortDateString() + "' " + string.Format(sqlWhereNow, "worker"));
            //sql.AppendLine("          group by worker ");

            sql.AppendLine("          Select ");
            sql.AppendLine("              worker, ");
            sql.AppendLine("              sum(range_money) as range_money, ");
            sql.AppendLine("              sum(case when inscrease_percent = 0 then 0 else range_money * (inscrease_percent / 100) end) as inscrease_range_money ");
            sql.AppendLine("          From (");
            sql.AppendLine("              select ");
            sql.AppendLine("                  CASE WHEN B2S.worker is not null then B2S.worker else B.worker end as worker, ");
            sql.AppendLine("                  (  (CASE  WHEN B2S.worker is not null then ");
            sql.AppendLine("                      (CASE WHEN ISNULL(B2S.share_percent, 0) = 0 THEN 100 ELSE B2S.share_percent / 100 end) / 100 ");
            sql.AppendLine("          	          else 1 end ");
            sql.AppendLine("                     ) * B.qty_pair * B.up_pair) as range_money, isnull(B.inscrease_percent, 0) as inscrease_percent ");
            sql.AppendLine("              from WPQty_B2 B ");
            sql.AppendLine("              left join WPQty_B2_Share B2S on B2S.wq_id = B.wq_id and B2S.wqb_id = B.wqb_id ");
            sql.AppendLine("              where B.jx_dd >= '" + S_jx_dd.ToShortDateString() + "' and B.jx_dd <= '" + E_jx_dd.ToShortDateString() + "' " + string.Format(sqlWhereNow, "(CASE WHEN B2S.worker is not null then B2S.worker else B.worker end)"));
            sql.AppendLine("            union all ");
            sql.AppendLine("              Select  B.sal_no as worker, sum(B.amt) as range_money, 0 as inscrease_range_money from dbo.JSQty_B B ");
            sql.AppendLine("              inner join dbo.JSQty_H H on H.js_no = B.js_no ");
            sql.AppendLine("              where H.js_dd >= '" + S_jx_dd.ToShortDateString() + "' and H.js_dd <= '" + E_jx_dd.ToShortDateString() + "' " + string.Format(sqlWhereNow, "B.sal_no"));
            sql.AppendLine("              group by B.sal_no ");
            sql.AppendLine("          ) As T");
            sql.AppendLine("          group by worker ");


            sql.AppendLine("      ) as T ");
            sql.AppendLine("      left join Salm S on S.user_no = T.worker ");
            sql.AppendLine("  ) as T2 ");


            sql.AppendLine("  select T.* from( ");
            sql.AppendLine("       select 1 as row_sort, * from #TA  " + (onlySumDept == true ? " where 1<> 1" : ""));
            sql.AppendLine("       union all ");
            sql.AppendLine("       select 2 as row_sort, worker_dep_no, '' as worker, sum(range_money) as range_money,         ");
            sql.AppendLine("              sum(inscrease_range_money) as inscrease_range_money,  0 AS work_day, AVG(day_money) as day_money, AVG(day_money2) as day_money2 ");
            sql.AppendLine("       from #TA               ");
            sql.AppendLine("       group by worker_dep_no ");
            sql.AppendLine("  ) as T ");
            sql.AppendLine("  order by T.worker_dep_no,T.row_sort ");

            return SqlHelper.ExecuteSql(sql.ToString());
        }

        //CompressByPairQty
        public DataTable GetDateRangeView(DateTime S_jx_dd, DateTime E_jx_dd, 
            bool onlySum, 
            string worker_dep_no, 
            string worker, string plan_no = "", string prd_no = "", bool needJSSum = true, bool onlyWPDetail = false  )
        {
            StringBuilder sql = GetBaseData(S_jx_dd, E_jx_dd, worker_dep_no, worker, plan_no: plan_no, prd_no: prd_no);

            if (needJSSum)
            {
                sql.Append(@"SELECT'1900-01-01' as jx_dd,  '' as dep_no, worker_dep_no, worker, '' as plan_no, '计时' as prd_no, 0 as plan_all_qty_pair, 
                                0 as size_qty_pair, '' as size, '' as wp_no , '合并计时明细' AS wp_name, 0 as plan_day_qty, 0 as day_qty_ut,
				                SUM(qty_pair) AS qty_pair, -1 as edit_ut, 0 as up_pair, sum(day_money) as day_money,
				                add_sign,
				                0 as inscrease_percent, 
				                100 as share_percent,      
				                0 as inscrease_money
                         into  #DaySUM_onJS
                         FROM #DayDetail_onJS 
                         GROUP BY worker_dep_no,worker, add_sign ");
            }


            sql.AppendLine(" ");
            sql.AppendLine("            select 2 as row_sort, '1900-01-01' as jx_dd, '' as dep_no, worker_dep_no, worker, '' as plan_no, '' as prd_no, 0 as plan_all_qty_pair, ");
            sql.AppendLine("                0 as size_qty_pair, '' as size, '' as wp_no, '' as wp_name, 0 as plan_day_qty, 0 as day_qty_ut, ");
            sql.AppendLine("                0 as qty_pair, 0 as edit_ut, 0 as up_pair, sum(day_money) as day_money,  add_sign, ");
            sql.AppendLine("                0 as inscrease_percent, ");
            sql.AppendLine("                0 as share_percent,      ");
            sql.AppendLine("                sum(inscrease_money) as inscrease_money      ");
            sql.AppendLine("             Into #DaySum_L0 ");
            sql.AppendLine("             from ( ");
            sql.AppendLine("                select 1 as row_sort, * from #DayDetail_onWP ");
            sql.AppendLine("                union all    ");
            sql.AppendLine("                select 1 as row_sort, * from #DayDetail_onJS ");
            sql.AppendLine("             ) AS T          ");
            sql.AppendLine("             group by worker_dep_no, worker, add_sign ");


            sql.AppendLine("            select 2 as row_sort, '1900-01-01' as jx_dd, '' as dep_no, worker_dep_no, worker, '' as plan_no, '' as prd_no, 0 as plan_all_qty_pair, ");
            sql.AppendLine("                0 as size_qty_pair, '' as size, '' as wp_no,");
            sql.AppendLine("                  ('车剪:' + cast( isnull((select day_money from #DaySum_L0 where #DaySum_L0.worker = T.worker  and add_sign = '车位剪线' ),'0') as varchar(100))  " +
                                              "+',杂车:' + cast(  isnull((select day_money from #DaySum_L0 where #DaySum_L0.worker = T.worker and add_sign = '杂工车位'),'0') as varchar(100)) " +
                                              "+',拼身:' + cast(  isnull((select day_money from #DaySum_L0 where #DaySum_L0.worker = T.worker  and add_sign = '拼身'),'0') as varchar(100)) " +
                                            ") as wp_name, ");
            sql.AppendLine("                0 as plan_day_qty, 0 as day_qty_ut, ");
            sql.AppendLine("                0 as qty_pair, 0 as edit_ut, 0 as up_pair, sum(day_money) as day_money, '' as add_sign, ");
            sql.AppendLine("                0 as inscrease_percent, ");
            sql.AppendLine("                0 as share_percent,      ");
            sql.AppendLine("                sum(inscrease_money) as inscrease_money      ");
            sql.AppendLine("             Into #DaySum_L1 ");
            sql.AppendLine("             from ( ");
            sql.AppendLine("                select * from #DaySum_L0 ");
            sql.AppendLine("             ) AS T          ");
            sql.AppendLine("             group by worker_dep_no, worker ");


            sql.AppendLine("            select 3 as row_sort, '1900-01-01' as jx_dd, '' as dep_no, '' as worker_dep_no, '' as worker, '' as plan_no, '' as prd_no, 0 as plan_all_qty_pair, ");
            sql.AppendLine("                0 as size_qty_pair, '' as size, '' as wp_no, '' as wp_name, 0 as plan_day_qty, 0 as day_qty_ut, ");
            sql.AppendLine("                0 as qty_pair, 0 as edit_ut, 0 as up_pair, sum(day_money) as day_money, '' as add_sign, ");
            sql.AppendLine("                0 as inscrease_percent, ");
            sql.AppendLine("                0 as share_percent,      ");
            sql.AppendLine("                sum(inscrease_money) as inscrease_money      ");
            sql.AppendLine("             Into #DaySum_L2 ");
            sql.AppendLine("             from #DaySum_L1 ");


            sql.AppendLine("     select ");
            sql.AppendLine("        row_sort2, row_sort, convert(varchar(100),jx_dd, 111) as jx_dd, '' as dep_no, worker_dep_no, worker,plan_no, prd_no, plan_all_qty_pair, ");
            sql.AppendLine("        size_qty_pair,size, wp_no,wp_name,plan_day_qty,day_qty_ut, ");
            sql.AppendLine("        qty_pair, edit_ut,up_pair,day_money, add_sign, ");
            sql.AppendLine("        inscrease_percent, ");
            sql.AppendLine("        share_percent,      ");
            sql.AppendLine("        inscrease_money      ");
            sql.AppendLine("      from ( ");
            sql.AppendLine("                select 1 as row_sort2, 1 as row_sort, * from #DayDetail_onWP " + (onlySum == true ? " where 1<> 1" : ""));

            if (onlyWPDetail == false)
            {
                sql.AppendLine("             union all    ");
                if (needJSSum)
                {
                    sql.AppendLine("                select 1 as row_sort2, 1 as row_sort, * from #DaySUM_onJS " + (onlySum == true ? " where 1<> 1" : ""));
                }
                else
                {
                    sql.AppendLine("                select 1 as row_sort2, 1 as row_sort, * from #DayDetail_onJS " + (onlySum == true ? " where 1<> 1" : ""));
                }

                sql.AppendLine("             union all ");
                sql.AppendLine("                select 1 as row_sort2, * from #DaySum_L1");
                sql.AppendLine("             union all ");
                sql.AppendLine("                select 2 as row_sort2, * from #DaySum_L2");
            }
            sql.AppendLine("      ) as T ");
            sql.AppendLine("     order by row_sort2, worker_dep_no, worker, row_sort ");
            sql.AppendLine("               ,case when add_sign = '' then 0 when add_sign = '拼身' then 1 when add_sign = '杂工车位' then 2 when add_sign = '车位剪线' then 3 end ");
            sql.AppendLine("               ,jx_dd , plan_no,size, wp_no ");
            
            return SqlHelper.ExecuteSql(sql.ToString());
        }

        public DataTable GetDateRangeCompressView(DateTime S_jx_dd, DateTime E_jx_dd, bool onlySum, string worker_dep_no, string worker, string plan_no = "", string prd_no = "", bool onlySheBao = false)
        {
            StringBuilder sql = GetBaseData(S_jx_dd, E_jx_dd, worker_dep_no, worker, plan_no: plan_no, prd_no: prd_no, onlySheBao : onlySheBao);

            sql.AppendLine("            select * into #DaySum_L0 from ( ");
            sql.AppendLine("            	select 1 as row_sort, *from #DayDetail_onWP  ");
            //sql.AppendLine("                union all ");
            //sql.AppendLine("                select 1 as row_sort, *from #DayDetail_onJS  ");
            sql.AppendLine("             ) AS T ");
            sql.AppendLine("                                                                                                                      ");
            sql.AppendLine("                select '1900-01-01' as jx_dd, worker_dep_no, worker, plan_no, prd_no, 0 as plan_all_qty_pair,  ");
            sql.AppendLine("                    0 as size_qty_pair, '' as size, wp_no, wp_name, 0 as plan_day_qty, 0 as day_qty_ut,  ");
            sql.AppendLine("                    sum(qty_pair) as qty_pair, 0 as edit_ut, up_pair, sum(day_money) as day_money, add_sign, ");
            sql.AppendLine("                    share_percent, inscrease_percent, sum(inscrease_money) as inscrease_money ");
            sql.AppendLine("                 Into #DaySum_LBaseUP ");
            sql.AppendLine("                 from #DaySum_L0 AS T           ");
            sql.AppendLine("                 group by worker_dep_no, worker, add_sign, plan_no, prd_no, wp_no, wp_name, up_pair, share_percent, inscrease_percent  ");
            sql.AppendLine("                 ORDER BY worker_dep_no, worker,  plan_no, prd_no, wp_no ");
            sql.AppendLine("                                                                                                                      ");
            //         --select * from #DaySum_LBaseUP

            //--下一步合并相同对数
            //         --  工序组表
            //         --  单价组表
            sql.AppendLine("                select 1 as row_sort, '1900-01-01' as jx_dd, worker_dep_no, worker,  plan_no, prd_no, 0 as plan_all_qty_pair,  ");
            sql.AppendLine("                   0 as size_qty_pair, '' as size, '' as wp_no,  ");
            sql.AppendLine("                   '' as wp_name,  ");
            sql.AppendLine("                   0 as plan_day_qty, 0 as day_qty_ut,  ");
            sql.AppendLine("                   qty_pair, 0 as edit_ut,  ");
            sql.AppendLine("                   0 as up_pair,  ");
            sql.AppendLine("                   sum(day_money) as day_money, add_sign, ");
            sql.AppendLine("                   share_percent, inscrease_percent, sum(inscrease_money) as inscrease_money, ");
            sql.AppendLine("                   ( ");
            sql.AppendLine("                       SELECT wp_name+'+' FROM #DaySum_LBaseUP B      ");
            sql.AppendLine("                       WHERE B.worker = T.worker and B.add_sign = T.add_sign and B.plan_no = T.plan_no and B.prd_no = T.prd_no and B.qty_pair = T.qty_pair ");
            sql.AppendLine("                             and B.share_percent = T.share_percent and B.inscrease_percent = T.inscrease_percent ");
            
            sql.AppendLine("                       group by B.wp_name  ");
            sql.AppendLine("                       order by B.wp_name  ");
            sql.AppendLine("                       FOR XML PATH('') ");
            sql.AppendLine("                   ) as wp_name_list,  ");
            sql.AppendLine("                   ( ");
            sql.AppendLine("                       SELECT cast(up_pair as varchar(100))+'+' FROM #DaySum_LBaseUP B       ");
            sql.AppendLine("                       WHERE B.worker = T.worker and B.add_sign = T.add_sign and B.plan_no = T.plan_no and B.prd_no = T.prd_no and B.qty_pair = T.qty_pair ");
            sql.AppendLine("                             and B.share_percent = T.share_percent and B.inscrease_percent = T.inscrease_percent ");
            sql.AppendLine("                       group by B.wp_name, B.up_pair ");
            sql.AppendLine("                       order by B.wp_name ");
            sql.AppendLine("                       FOR XML PATH('') ");
            sql.AppendLine("                   ) as up_pair_list ");
            sql.AppendLine("                into #DaySum_L1 ");

            sql.AppendLine("                from #DaySum_LBaseUP T ");
            sql.AppendLine("                group by worker_dep_no, worker, add_sign, plan_no, prd_no, share_percent, inscrease_percent,qty_pair ");
            sql.AppendLine("                order by worker_dep_no, worker, case when add_sign = '' then 0 when add_sign = '拼身' then 1 when add_sign = '杂工车位' then 2 when add_sign = '车位剪线' then 3 end  ");
            sql.AppendLine("                              ,plan_no, prd_no, share_percent, inscrease_percent,qty_pair                                                                                          ");


            sql.AppendLine("                 select 1 as row_sort, '1900-01-01' as jx_dd, worker_dep_no, worker, '' as plan_no, '' as prd_no, 0 as plan_all_qty_pair, ");
            sql.AppendLine("                             0 as size_qty_pair, '' as size, '' as wp_no, ");
            sql.AppendLine("                             '' as wp_name, ");
            sql.AppendLine("                             0 as plan_day_qty, 0 as day_qty_ut, ");
            sql.AppendLine("                             0 as qty_pair, 0 as edit_ut, 0 as up_pair, 0 as day_money, '' as add_sign, ");
            sql.AppendLine("                             0 as share_percent, 0 as inscrease_percent, 0 as inscrease_money, ");
            sql.AppendLine("                             '' as wp_name_list, '' as up_pair_list ");
            sql.AppendLine("                       into  #DaySum_L1_CopyEmptyZero ");
            sql.AppendLine("                       from #DaySum_L1 ");
            sql.AppendLine("                       group by worker_dep_no, worker ");
            
            sql.AppendLine("                select 2 as row_sort, '1900-01-01' as jx_dd, worker_dep_no, worker, '' as plan_no, '' as prd_no, 0 as plan_all_qty_pair, ");
            sql.AppendLine("                    0 as size_qty_pair, '' as size, '' as wp_no, ");
            sql.AppendLine("                    '' as wp_name,  ");
            sql.AppendLine("                    0 as plan_day_qty, 0 as day_qty_ut,  ");
            sql.AppendLine("                    0 as qty_pair, 0 as edit_ut, 0 as up_pair, sum(day_money) as day_money, '' as add_sign , ");
            sql.AppendLine("                    0 as share_percent, 0 as inscrease_percent, sum(inscrease_money) as inscrease_money,  ");
            
            sql.AppendLine("                    ('车剪:' + cast(isnull((select sum(day_money) from #DaySum_L0 where #DaySum_L0.worker = T.worker  and add_sign = '车位剪线' ),'0') as varchar(100))   ");
            sql.AppendLine("                        + ',杂车:' + cast(isnull((select sum(day_money) from #DaySum_L0 where #DaySum_L0.worker = T.worker and add_sign = '杂工车位'),'0') as varchar(100))  ");
            sql.AppendLine("                        +' ,拼身:' + cast(isnull((select sum(day_money) from #DaySum_L0 where #DaySum_L0.worker = T.worker  and add_sign = '拼身'),'0') as varchar(100)) ");
            sql.AppendLine("                        +' ,计时附加:' + cast(isnull((select sum(day_money) from #DayDetail_onJS where #DayDetail_onJS.worker = T.worker and  add_sign = '有附加'),'0') as varchar(100)) ");
            sql.AppendLine("                        +' ,计时无附加:' + cast(isnull((select sum(day_money) from #DayDetail_onJS where #DayDetail_onJS.worker = T.worker and  add_sign = ''),'0') as varchar(100))    )");

            sql.AppendLine("                    as wp_name_list, '' as up_pair_list ");
            sql.AppendLine("                 Into #DaySum_L2  ");

            sql.AppendLine("                 from( ");
            ////   6.29佩仪话,小计不要包含车位剪线,方便她区分附加工资,做总表
            ///       8.11 增加一空行，以防不见了小计行
            sql.AppendLine("                    select * from #DaySum_L1_CopyEmptyZero ");
            sql.AppendLine("                    union all ");
            sql.AppendLine("                    select * from #DaySum_L1 WHERE add_sign <> '车位剪线' ");
            
            sql.AppendLine("                 ) AS T ");
            sql.AppendLine("                 group by worker_dep_no, worker ");
            sql.AppendLine("                                                                                                                      ");

            sql.AppendLine("                 select 3 as row_sort, '1900-01-01' as jx_dd, worker_dep_no, '' as worker, '' as plan_no, '' as prd_no, 0 as plan_all_qty_pair, ");
            sql.AppendLine("                    0 as size_qty_pair, '' as size, '' as wp_no, ");
            sql.AppendLine("                    '' as wp_name, ");
            sql.AppendLine("                    0 as plan_day_qty, 0 as day_qty_ut, ");
            sql.AppendLine("                    0 as qty_pair, 0 as edit_ut, 0 as up_pair, sum(day_money) as day_money, '' as add_sign, ");
            sql.AppendLine("                    0 as share_percent, 0 as inscrease_percent, sum(inscrease_money) as inscrease_money,  ");
           
            sql.AppendLine("                    ('车剪:' + cast(isnull((select sum(day_money) from #DaySum_L0 where #DaySum_L0.worker_dep_no = T.worker_dep_no  and add_sign = '车位剪线' ),'0') as varchar(100))   ");
            sql.AppendLine("                        + ',杂车:' + cast(isnull((select sum(day_money) from #DaySum_L0 where #DaySum_L0.worker_dep_no = T.worker_dep_no and add_sign = '杂工车位'),'0') as varchar(100))  ");
            sql.AppendLine("                        + ',拼身:' + cast(isnull((select sum(day_money) from #DaySum_L0 where #DaySum_L0.worker_dep_no = T.worker_dep_no  and add_sign = '拼身'),'0') as varchar(100))   ");
            sql.AppendLine("                        +' ,计时附加:' + cast(isnull((select sum(day_money) from #DayDetail_onJS where #DayDetail_onJS.worker_dep_no = T.worker_dep_no and  add_sign = '有附加'),'0') as varchar(100)) ");
            sql.AppendLine("                        +' ,计时无附加:' + cast(isnull((select sum(day_money) from #DayDetail_onJS where #DayDetail_onJS.worker_dep_no = T.worker_dep_no and  add_sign = ''),'0') as varchar(100))    )");

            sql.AppendLine("                    as wp_name_list, '' as up_pair_list ");
            sql.AppendLine("                 Into #DaySum_L3  ");
            sql.AppendLine("                 from( ");
            sql.AppendLine("                    select * from #DaySum_L2 ");
            sql.AppendLine("                 ) AS T ");
            sql.AppendLine("                 group by worker_dep_no ");
            sql.AppendLine("                                                                                                                      ");

            sql.AppendLine("                 select 4 as row_sort, '1900-01-01' as jx_dd, '' as worker_dep_no, '' as worker, '' as plan_no, '' as prd_no, 0 as plan_all_qty_pair, ");
            sql.AppendLine("                    0 as size_qty_pair, '' as size, '' as wp_no, ");
            sql.AppendLine("                    '' as wp_name, ");
            sql.AppendLine("                    0 as plan_day_qty, 0 as day_qty_ut, ");
            sql.AppendLine("                    0 as qty_pair, 0 as edit_ut, 0 as up_pair, sum(day_money) as day_money, '' as add_sign, ");
            sql.AppendLine("                    0 as share_percent, 0 as inscrease_percent, sum(inscrease_money) as inscrease_money,  ");
            sql.AppendLine("                    ('车剪:' + cast(isnull((select sum(day_money) from #DaySum_L0 where add_sign = '车位剪线' ),'0') as varchar(100))   ");
            sql.AppendLine("                        + ',杂车:' + cast(isnull((select sum(day_money) from #DaySum_L0 where add_sign = '杂工车位'),'0') as varchar(100))  ");
            sql.AppendLine("                        + ',拼身:' + cast(isnull((select sum(day_money) from #DaySum_L0 where add_sign = '拼身'),'0') as varchar(100))   ");
            sql.AppendLine("                        +' ,计时附加:' + cast(isnull((select sum(day_money) from #DayDetail_onJS where add_sign = '有附加'),'0') as varchar(100)) ");
            sql.AppendLine("                        +' ,计时无附加:' + cast(isnull((select sum(day_money) from #DayDetail_onJS where  add_sign = ''),'0') as varchar(100))    )");

            sql.AppendLine("                    as wp_name_list, '' as up_pair_list ");
            sql.AppendLine("                 Into #DaySum_L4  ");
            sql.AppendLine("                 from( ");
            sql.AppendLine("                    select * from #DaySum_L3 ");
            sql.AppendLine("                 ) AS T ");
            sql.AppendLine("                                                                                                                      ");
            sql.AppendLine("                                                                                                                      ");


            sql.AppendLine("                select  3 as row_sort2, *from #DaySum_L4 ");
            sql.AppendLine("                union all ");
            sql.AppendLine("                 select ");
            sql.AppendLine("                    row_sort2, row_sort, convert(varchar(100), jx_dd, 111) as jx_dd, worker_dep_no, worker, plan_no, prd_no, plan_all_qty_pair, ");
            sql.AppendLine("                    size_qty_pair, size, wp_no, wp_name, plan_day_qty, day_qty_ut, ");
            sql.AppendLine("                    qty_pair, edit_ut, up_pair, day_money, add_sign,");
            sql.AppendLine("                    share_percent, inscrease_percent, inscrease_money, ");
            sql.AppendLine("                    wp_name_list, up_pair_list ");
            sql.AppendLine("                  from( ");
            sql.AppendLine("                        select  1 as row_sort2, *from #DaySum_L1 " + (onlySum == true ? " where 1<> 1" : ""));
            sql.AppendLine("                         union all ");
            sql.AppendLine("                        select 1 as row_sort2, *from #DaySum_L2 ");
            sql.AppendLine("                            union all ");
            sql.AppendLine("                        select 1 as row_sort2, *from #DaySum_L3 ");
            sql.AppendLine("                 ) as T ");
            sql.AppendLine("                 order by row_sort2, worker_dep_no, worker, row_sort ");
            return SqlHelper.ExecuteSql(sql.ToString());
        }
    }
}
