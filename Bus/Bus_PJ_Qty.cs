using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using SMS.Model;
using SMS.DAL;

namespace SMS.Bus
{
    public class Bus_PJ_Qty
    {
        private readonly Dal_PJ_Qty dal = new Dal_PJ_Qty();


        public DataTable GetListByPage(string strWhere, string orderby, int startIndex, int endIndex)
        {
            return dal.GetListByPage(strWhere, orderby, startIndex, endIndex);
        }

        public int GetRecordCount(string strWhere)
        {
            return dal.GetRecordCount(strWhere);
        }


        public bool TableAdd(Model_PJQty_H model)
        {
            return dal.TableAdd(model);
        }

        public bool TableUpdate(Model_PJQty_H model)
        {
            return dal.TableUpdate(model);
        }

        public bool TableDelete(string pj_no)
        {
            return dal.TableDelete(pj_no);
        }

        public DataTable GetDoneWPQty(int plan_id, string wp_dep_no, string user_dep_no, DateTime? wp_start_dd, DateTime? wp_end_dd)
        {
            string sql = @"
                 	 select 
                        T.*, S.color_id, S.size, M3.price, M2.use_unit as std_unit_pre
                     from ( select 
		                        B.size_id,  (CASE WHEN B2S.worker is not null then B2S.worker else B.worker end)as  worker, B.wp_no, P.prd_no, P.name as wp_name, 
		                        sum(isnull(B.qty_pair,0)) as done_pair,sum(isnull(B.qty_pic,0)) as done_pic
		                        from WPQty_B2  B
                                LEFT JOIN WPQty_B2_Share B2S ON B2S.wqb_id = B.wqb_id
		                        LEFT JOIN PRDT_WP P on P.prd_no = B.prd_no AND P.wp_no = B.wp_no 
		                        LEFT JOIN SALM S ON S.user_no = (CASE WHEN B2S.worker is not null then B2S.worker else B.worker end) 
                            where 1=1  and P.save_material_award = 'true' {0}
	                        group by B.size_id,  (CASE WHEN B2S.worker is not null then B2S.worker else B.worker end), P.prd_no,B.wp_no, P.name 
                        ) T
                    LEFT JOIN Workplan_sizes S ON S.size_id = T.size_id 
                    LEFT JOIN  PrdtWpMaterial M1 on M1.prd_no = T.prd_no and M1.wp_no = T.wp_no
                    LEFT JOIN  PrdtWpMaterialSize M2 on M2.wm_id = M1.wm_id and M2.size = S.size
                    LEFT JOIN  Material M3 on M3.material_id = M1.material_id
                    ";

            string sqlWhere = " And B.wq_id in (select wq_id from WPQty_H2 where plan_id=" + plan_id + ")";

            if (wp_start_dd != null)
            {
                sqlWhere += " And B.jx_dd >= '" + wp_start_dd.Value.ToShortDateString() + "' ";
            }
            if (wp_end_dd != null)
            {
                sqlWhere += " And B.jx_dd <= '" + wp_end_dd.Value.ToShortDateString() + "' ";
            }

            if (!string.IsNullOrEmpty(wp_dep_no) && wp_dep_no != "000000")
            {
                sqlWhere += " And P.dep_no = '" + wp_dep_no.Trim() + "'";
            }
            if (!string.IsNullOrEmpty(user_dep_no) && user_dep_no != "000000")
            {
                sqlWhere += " And S.dep_no = '" + user_dep_no.Trim() + "'";
            }

            return string.Format(sql, sqlWhere).SearchDB();
        }

        public DataTable GetPJQty(int size_id, string exceptPJNo)
        {
            return dal.GetPJQty(size_id, exceptPJNo);
        }



        public List<DataTable> GetTableData(string pj_no)
        {
            return dal.GetTableData(pj_no);
        }

        ////public DataTable GetReportData(string sqlWhere)
        ////{
        ////    return dal.GetReportData(sqlWhere);
        ////}

        ////public DataTable GetReportSumQty(string sqlWhere)
        ////{
        ////    return dal.GetReportSumQty(sqlWhere);
        ////}



    }
}
