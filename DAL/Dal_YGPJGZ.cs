using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SMS.Model;

using System.Data;
using System.Data.SqlClient;
using SMS.DBHelper;

namespace SMS.DAL
{
    public class Dal_YGPJGZ
    {
        public DataTable GetReportData(string JSStrWhere, string GZStrWhere)
        {
            StringBuilder str = new StringBuilder();

            str.Append("        ");
            str.Append("        select dep_no,sal_no, isNull(is_add, 'N') as is_add, sal_type  ,sum(amt) as amt into #A1 from ( ");
		    str.Append("                 select * from ( ");
			str.Append("                    select A.js_dd,S.name as sal_name,S.[type] as sal_type,D.dep_no,D.name as dep_name,B.* from JSQty_H A ");
			str.Append("                    LEFT JOIN JSQty_B B ON B.JS_NO = A.JS_NO  ");
			str.Append("                    LEFT JOIN salm S on S.user_no = B.sal_no  ");
			str.Append("                    LEFT JOIN Dept D on D.dep_no = S.dep_no  ");
		    str.Append("                ) as TIn ");
		    str.Append("                where 1 = 1 ");
                                    if (JSStrWhere.Trim() != "")
                                    {
                                        str.Append("  and " + JSStrWhere);
                                    }
	        str.Append("            ) AS T ");
	        str.Append("            group by dep_no,sal_no,sal_type,is_add  ");


            str.Append("        select T4.*, D.name as dep_name  from ( ");
	        str.Append("            select dep_no,sal_type,sum(qty) / count(1) as pjgz from ( ");
		    str.Append("                select T2.* from ( ");
			str.Append("                    select dep_no,sal_no,sal_type, sum(qty) as qty from( ");
			str.Append("        	            select   ");
			str.Append("        		            A.prd_no,  ");
			str.Append("        		            1 as ut, B.itm, B.wp_no,   ");
			str.Append("        		            B.sal_no,   ");
			str.Append("        		            S.type as sal_type,  ");
			str.Append("        		            case when WP.is_cutWp ='false' then 'N' else 'Y' end as wpis_cut, ");
			str.Append("        		            B.qty , ");
			str.Append("        		            P.dep_no,   ");
			str.Append("        		            (	select top 1 T2.up_no from (  ");   
			str.Append("        			              select      ");
			str.Append("          				            CASE       ");
            str.Append("          						            when dep_no = A.user_dep_no then 5    ");  
			str.Append("          						            when isnull(dep_no,'') = '' then 0     "); 
			str.Append("          						            else 0      ");
			str.Append("          					            end AS V1,     ");
			str.Append("          					            case      ");
			str.Append("          						            when (dep_no is null or dep_no = '') then len(up_road) *-1 ");     
			str.Append("                 					            else     ");
			str.Append("          						            CHARINDEX(dep_no+',', up_road) * -1 end AS V2,    "); 
            str.Append("          					            case WHEN cus_no = SO.cus_no THEN 3       ");
			str.Append("          						            WHEN ISNULL(cus_no,'') = '' THEN 0    ");   
			str.Append("          						            ELSE -3 end AS V3 ,   ");  
			str.Append("          					            T.*      ");
			str.Append("        			              from (     ");
			str.Append("          				            SELECT       ");
			str.Append("          					            HUP.*,dep.up_road      ");
			str.Append("          				            FROM prdt_wp_hfup HUP       ");
            str.Append("          				            left join dept dep on dep.dep_no = A.user_dep_no     "); 
			str.Append("          				            WHERE      ");
			str.Append("          					            DATEDIFF(dd,HUP.start_dd, A.jx_dd) >=0      ");
            str.Append("          					            AND DATEDIFF(dd,HUP.end_dd, A.jx_dd) <=0        ");
    		str.Append("          					            AND  HUP.prd_no = A.prd_no      ");
    		str.Append("          					            AND  (HUP.dep_no = dep.dep_no or HUP.dep_no = '' or dep.up_road like '%' + HUP.dep_no+ ',%' )     ");
    		str.Append("        			              ) AS T     ");
			str.Append("        		              ) as T2     ");
			str.Append("        		              where V3 >= 0      ");
			str.Append("        		              ORDER  BY V1 desc,V2 desc,V3 desc    "); 
			str.Append("        		            ) as up_no ");
			str.Append("        	            from WPQty_H A ");
			str.Append("        		            left join WPQty_B B on B.jx_no = A.jx_no  ");
			str.Append("        		            left join Salm S on S.user_no = B.sal_no ");
			str.Append("        		            left join Dept P on P.dep_no = S.dep_no ");
			str.Append("        		            left join Prdt on Prdt.prd_no = A.prd_no  ");
			str.Append("        		            left join Prdt_WP WP on WP.prd_no = A.prd_no and WP.wp_no = B.wp_no  ");
			str.Append("        		            left join MF_SO SO on SO.so_no = A.so_no  ");
            str.Append("        		                                            ");
            str.Append("        	            where 1 = 1 ");
                                            if (GZStrWhere.Trim() != "")
                                            {
                                                str.Append("  and " + GZStrWhere);
                                            }
			str.Append("                    ) as T ");
			str.Append("                    group by dep_no,sal_no,sal_type ");
			str.Append("                                                                ");
			str.Append("                    union all ");
			str.Append("        	            select dep_no, sal_no, sal_type, isnull(amt,0) as jsamt  ");
			str.Append("        	            from #A1  ");
		    str.Append("                ) AS T2 ");
		
	        str.Append("            ) T3 ");
	        str.Append("            group by dep_no,sal_type ");
            str.Append("        ) T4  ");
            str.Append("        LEFT JOIN Dept D on D.dep_no = T4.dep_no ");

            return SqlHelper.ExecuteSql(str.ToString());
        }
    }
}
