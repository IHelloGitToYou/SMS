using SMS.DBHelper;
using SMS.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;

namespace SMS.Bus
{
    public class Bus_CheckHelper
    {
        public static DataTable GetFlow(string check_no)
        {
            return SqlHelper.ExecuteSql(string.Format("Select check_no, check_itm, check_man from CheckFlow Where check_no = '{0}' order by check_itm asc", check_no));
        }

        public static void ResetFlow(string check_no, List<string> CheckMans)
        {
            //return SqlHelper.ExecuteSql(string.Format("Select check_no, check_itm, check_man from CheckFlow Where check_no = '{0}' order by check_itm asc", check_no));
            bool isOnUseing = GetAsk(" check_no = '" + check_no + "' and check_state= 0").Rows.Count > 0;
            if (isOnUseing)
            {
                throw new Exception("还有未审核完成的任务,不能变更本流程!");
            }

            string format = "Insert CheckFlow(check_no, check_itm, check_man) values('{0}', '{1}', '{2}')";
            List<SqlCommand> cmds = new List<SqlCommand>();
            cmds.Add(new SqlCommand(" Delete CheckFlow where check_no = '" + check_no + "'"));

            int i = 0;
            foreach (string man in CheckMans)
            {
                cmds.Add(new SqlCommand(string.Format(format, check_no, i, man)));
                ++i;
            }

            SqlHelper.ExecuteTransWithCollections(cmds);
        }


        public static int InsertAsk(Model_AskPrice model)
        {
            var firstFlow = GetFlow(model.check_no).AsEnumerable().Where(o => o["check_itm"].ToString() == "0").FirstOrDefault();
            if(firstFlow == null)
            {
                throw new Exception("不存在审核流程[" + model.check_no + "]");
            }

            string sqlInsert = string.Format(@"INSERT INTO [AskPrice]([check_state],[check_no],[check_itm],[check_man],
                [n_man],[n_dd],[jx_no],[prd_no],[wp_no],[up_pic],[up_pair],[ask_up_pic],[ask_up_pair],[ask_reason],[check_msg]) 
                VALUES('{0}', '{1}', '{2}', '{3}', '{4}','{5}', '{6}', '{7}', '{8}', '{9}','{10}', '{11}', '{12}', '{13}', '{14}'); SELECT @@IDENTITY",
                    model.check_state, model.check_no, 0, firstFlow["check_man"].ToString(), model.n_man, model.n_dd, 
                    model.jx_no, model.prd_no, model.wp_no, model.up_pic, model.up_pair
                    ,model.ask_up_pic, model.ask_up_pair, model.ask_reason, ""
                );

            return int.Parse(SqlHelper.ExecuteScalar(sqlInsert).ToString());
        }


        public static void UpdateAskOnRunCheck(Model_AskPrice model)
        {
            string sqlUpdate = string.Format("Update AskPrice set check_state = {0}, check_man='{1}', check_itm = {2}, check_msg='{3}' where ask_id = {4}",
                model.check_state, model.check_man, model.check_itm, model.check_msg, model.ask_id
            );

            SqlHelper.ExecuteSql(sqlUpdate).ToString();
        }


        public static DataTable GetAsk(string sqlWhere)
        {
            return SqlHelper.ExecuteSql("select * from ("+ ConstSqlSelect + ") t where " + sqlWhere + ConstSqlOrderBy);
        }


        public static DataRow GetAskById(int ask_id)
        {
            var dt = SqlHelper.ExecuteSql("select * from (" + ConstSqlSelect + ") t where ask_id = " + ask_id + ConstSqlOrderBy);
            if (dt.Rows.Count > 0)
                return dt.Rows[0];

            return null;
        }


        private const string ConstSqlSelect = @"select 
                a.*, u.name as n_man_name, u2.name as check_man_name, 
                h.plan_no, wp.name as wp_name 
            from AskPrice a
            left join SYSUser u on u.user_no = a.n_man 
            left join SYSUser u2 on u2.user_no = a.check_man
            left join WPQty_H2 h on h.jx_no = a.jx_no
            left join prdt_wp  wp on wp.prd_no = a.prd_no and wp.wp_no = a.wp_no";


        private const string ConstSqlOrderBy = "   ORDER BY check_state asc, n_dd, jx_no, prd_no ,wp_no";


        public static DataTable GetPassAskPrice(string jx_no)
        {
            string sql = @"select * from AskPrice where check_state = 1 and 1=1 {0}
                order by jx_no desc ";

            if (!string.IsNullOrEmpty(jx_no))
            {
                sql = string.Format(sql, " and jx_no = '" + jx_no.Trim() + "'");
            }
            else
            {
                sql = string.Format(sql, " ");
            }

            return SqlHelper.ExecuteSql(sql);
        }

        public static void SetPriceByPassAskPrice(int ask_id)
        {
            DataTable dt = GetAsk(" ask_id = " + ask_id);
            SetPriceByPassAskPrice(dt, ask_id);
        }


        public static void SetPriceByPassAskPrice(DataTable dtPassedAskPrice, int ask_id)
        {
            //var checkRow = GetAskById(ask_id);
            var checkRow = dtPassedAskPrice.AsEnumerable().Where(o => int.Parse(o["ask_id"].ToString()) == ask_id).FirstOrDefault();
            if(checkRow == null)
            {
                return ;
            }

            if (int.Parse(checkRow["check_state"].ToString()) == 1)
            {
                string jx_no = checkRow["jx_no"].ToString();
                string prd_no = checkRow["prd_no"].ToString();
                string wp_no = checkRow["wp_no"].ToString();
                decimal ask_up_pair = decimal.Parse(checkRow["ask_up_pair"].ToString());
                decimal ask_up_pic = decimal.Parse(checkRow["ask_up_pic"].ToString());

                var wpHeader = Bus_WPQtyBySize.GetHeaderByJX(jx_no);
                if (wpHeader == null)
                {
                    throw new Exception("计件单不存在!" + jx_no);
                }

                //找出wq_id
                string sql = "Update WpQty_B2 set up_pic = {3},up_pair={4} where wq_id = {0} and prd_no = '{1}' and wp_no = '{2}'";
                string sql2 = string.Format(sql, int.Parse(wpHeader["wq_id"].ToString()), prd_no, wp_no, ask_up_pic, ask_up_pair);

                SqlHelper.ExecuteNonQuery(new SqlCommand() { CommandText = sql2 });
            }
        }
    }
}
