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
    public class Bus_CheckData
    {
        public static DataTable GetDayMoney_InH2(DateTime S_deliver_dd, DateTime E_deliver_dd, string plan_no, string wp_dep_no)
        {
            string sql = @"
                 select 
                    size_id ,wp_no,sum(isnull(qty_pair,0)) as done_pair,sum(isnull(qty_pic,0)) as done_pic 
	                Into #Done
                 from WPQty_B2 
                 group by size_id,wp_no
                    
                 select 
                    S.plan_id ,B.wp_no,sum(isnull(qty_pair,0)) as done_pair,sum(isnull(qty_pic,0)) as done_pic 
	                Into #Done2
                 from WPQty_B2 B
				 left join WorkPlan_Sizes S on S.size_id = B.size_id
                 group by S.plan_id,wp_no
                
                select * from (
                     select * from (
	                     select 
                            Z.plan_no, wp.name, Z.size_id,  p.prd_no, Z.size,Z.qty, 
                            P.sizes_qty as all_qty, WP.wp_no, wp.wq_type check_type, wp.pic_num, 
                            Z.qty as ceil_pair, Z.qty * wp.pic_num as ceil_pic,
                            P.sizes_qty as ceil_all_pair, P.sizes_qty * wp.pic_num as ceil_all_pic,
                            D.done_pair, D.done_pic
                        from WorkPlan_Sizes Z
                        left join WorkPlan P ON P.plan_id = Z.plan_id
                        left join prdt_wp WP on WP.prd_no = P.prd_no 
                        left join #Done D on D.size_id = Z.size_id and D.wp_no = wp.wp_no
	                    where  WP.wq_type = 'size_qty' and  P.deliver_dd >= '{0}' and P.deliver_dd <= '{1}' {2} 
                     ) as T
                     WHERE 
                      (done_pair > ceil_pair) or (done_pic > ceil_pic)

                    union all 

					select * from (
						 select 
							P.plan_no, wp.name, 0 AS  size_id,  p.prd_no, '' AS  size, P.sizes_qty, 
							P.sizes_qty as all_qty, WP.wp_no, wp.wq_type check_type, wp.pic_num, 
							P.sizes_qty as ceil_pair, P.sizes_qty * wp.pic_num as ceil_pic,
							P.sizes_qty as ceil_all_pair, P.sizes_qty * wp.pic_num as ceil_all_pic,
							D.done_pair, D.done_pic
						 from WorkPlan P
						 left join prdt_wp WP on WP.prd_no = P.prd_no 
						 left join #Done2 D on D.plan_id = P.plan_id and D.wp_no = WP.wp_no 
						 where WP.wq_type = 'all_size_qty' and P.deliver_dd >= '{0}' and P.deliver_dd <= '{1}' {2} 
					) as T
					 WHERE 
						(done_pair > ceil_all_pair) or (done_pic > ceil_all_pic)
                ) BT
                 order by check_type, plan_no, wp_no
            ";

            string sPlan = "";
            if (!string.IsNullOrEmpty(plan_no))
            {
                sPlan = " And P.plan_no like '%" + plan_no.Trim() + "%'";
            }
            if (!string.IsNullOrEmpty(wp_dep_no) && wp_dep_no != "000000")
            {
                sPlan = " And wp.dep_no = '" + wp_dep_no.Trim() + "'";
            }

            return SqlHelper.ExecuteSql(string.Format(sql, S_deliver_dd.Date.ToString(), E_deliver_dd.Date.ToString(), sPlan));
        }
    }
}
