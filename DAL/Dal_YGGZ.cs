using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SMS.Model;
using System.Web;

using System.Data;
using System.Data.SqlClient;
using SMS.DBHelper;

namespace SMS.DAL
{
    public class Dal_YGGZ
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="sqlWhere"></param>
        /// <param name="GetType">A.超明细  B.汇总明细</param>
        /// <returns></returns>
        public DataTable GetData(string sqlWhere, string sqlWhereJs, string GetType)
        {
            StringBuilder str = new StringBuilder();

            str.Append("    ");
            //---计时工资的汇总
            str.Append(" select sal_no, isNull(is_add, 'N') as is_add, sum(amt) as amt into #A1  from ( ");
	        str.Append("     select * from ( ");
		    str.Append("         select A.js_dd,S.name as sal_name,D.dep_no,D.name as dep_name,B.* from JSQty_H A ");
		    str.Append("         LEFT JOIN JSQty_B B ON B.JS_NO = A.JS_NO  ");
		    str.Append("         LEFT JOIN salm S on S.user_no = B.sal_no  ");
		    str.Append("        LEFT JOIN Dept D on D.dep_no = S.dep_no  ");
	        str.Append("     ) as TIn ");
            str.Append("     where 1 = 1 ");
            if (!string.IsNullOrEmpty(sqlWhereJs))
            {
                str.Append("  and " + sqlWhereJs);
            }
	        
            str.Append(" ) AS T ");
            str.Append(" group by sal_no,is_add ");

            str.Append("    ");
            str.Append(" select T.*, isnull(TUP.up_pair,0) as up_pair, isnull(TUP.up_pic,0) as up_pic, (isnull(TUP.up_pair,0) * T.qty) as amt,  ");
            str.Append("     case when TUP.up_pic is null then 'T' else 'F' end as upbug " + (GetType.ToUpper() == "A" ?  ""  : " into #A2 ") ); 
	        str.Append("     from(    ");
            str.Append("     select A.jx_no, convert(varchar(100), A.jx_dd, 111) as jx_dd, A.so_no,A.so_itm, A.prd_no, prdt.name as prd_name ,  ");
            str.Append("         1 as ut, B.itm, B.wp_no, WP.name as wp_name, B.sal_no,S.name as sal_name, B.qty ,  ");
            str.Append("		case when WP.is_cutWp ='false' then 'N' else 'Y' end as wpis_cut,  ");
		    str.Append("        case   ");
			str.Append("            when (WP.is_cutWp ='true' and S.type <> 5) then '1'	  ");	//--1.车位剪线
			str.Append("            when (WP.is_cutWp = 'false' and S.type = 5) then '2'  ");	//--2.杂工车位
            str.Append("            when (WP.is_psWp = 'true' ) then '3'                 ");	//--3.拼身
			str.Append("            else ''										          ");		//--0.普通工资
		    str.Append("        end as clc_type,                                          ");
            str.Append("         P.dep_no, P.name as dep_name,   ");
            str.Append("           (	select top 1 T2.up_no from (      "); 
			str.Append("           select        ");
			str.Append("         	    CASE         ");
            str.Append("         			    when dep_no = A.user_dep_no then 5        ");
			str.Append("         			    when isnull(dep_no,'') = '' then 0       "); 
			str.Append("         			    else 0        ");
			str.Append("         		    end AS V1,       ");
			str.Append("         		    case        ");
			str.Append("         			    when (dep_no is null or dep_no = '') then len(up_road) *-1     ");   
			str.Append("         		    else       ");
			str.Append("         			    CHARINDEX(dep_no+',', up_road) * -1 end AS V2,      "); 
            str.Append("         		    case WHEN cus_no = SO.cus_no THEN 3         ");
			str.Append("         			    WHEN ISNULL(cus_no,'') = '' THEN 0         ");
			str.Append("         			    ELSE -3 end AS V3 ,       ");
			str.Append("         		    T.*        ");
			str.Append("             from (       ");
			str.Append("         	    SELECT         ");
			str.Append("         		    HUP.*,dep.up_road        ");
			str.Append("         	    FROM prdt_wp_hfup HUP         ");
            str.Append("         	    left join dept dep on dep.dep_no = A.user_dep_no        ");
			str.Append("         	    WHERE        ");
			str.Append("         		    DATEDIFF(dd,HUP.start_dd, A.jx_dd) >=0        ");
            str.Append("         		    AND DATEDIFF(dd,HUP.end_dd, A.jx_dd) <=0          ");
    		str.Append("         		    AND  HUP.prd_no = A.prd_no        ");
    		str.Append("         		    AND  (HUP.dep_no = dep.dep_no or HUP.dep_no = '' or dep.up_road like '%' + HUP.dep_no+ ',%' )    ");   
    		str.Append("             ) AS T       ");
		    str.Append("         ) as T2       ");
	        str.Append("         where V3 >= 0        ");
	        str.Append("         ORDER  BY V1 desc,V2 desc,V3 desc       ");
            str.Append("       ) as up_no,   ");

            //str.Append("         ( select   T.up_no from (SELECT  TOP 1 up_no, CASE   ");
            //str.Append(" 	            WHEN cus_no = SO.cus_no THEN 10   ");
            //str.Append(" 	            WHEN ISNULL(cus_no,'') = '' THEN 8   ");
            //str.Append(" 	            ELSE 2 END AS MatchValue     ");
            //str.Append("             FROM prdt_wp_hfup HUP   ");
            //str.Append("             WHERE DATEDIFF(dd,HUP.start_dd, A.jx_dd) >=0 AND DATEDIFF(dd,HUP.end_dd, A.jx_dd) <=0  ");
            //str.Append(" 	            AND  HUP.prd_no = Prdt.prd_no   ");
            //str.Append("             ORDER  BY MatchValue DESC  ");
            //str.Append("             ) AS T   ");
            //str.Append("         ) as up_no,  ");

            str.Append("         isnull(Js.amt,0) as jsamt1,	");//--有附加计时工资
		    str.Append("         isnull(Js2.amt,0) as jsamt2,   ");  //--无附加计时工资
            str.Append("         isnull(TSO.qty,0) * isnull(WP.pic_num,1) as so_pic_qty,   ");
            str.Append("         isnull(TSO.qty,0) as so_qty    "); 

	        str.Append("     from WPQty_H A  ");
		    str.Append("         left join WPQty_B B on B.jx_no = A.jx_no   ");
		    str.Append("         left join Salm S on S.user_no = B.sal_no  ");
		    str.Append("         left join Dept P on P.dep_no = S.dep_no  ");
		    str.Append("         left join Prdt on Prdt.prd_no = A.prd_no   ");
		    str.Append("         left join Prdt_WP WP on WP.prd_no = A.prd_no and WP.wp_no = B.wp_no   ");
		    str.Append("         left join MF_SO SO on SO.so_no = A.so_no   ");
            str.Append("         left join TF_SO TSO on TSO.so_no = A.so_no and TSO.itm = A.so_itm ");
            str.Append("         left join #A1 Js on Js.sal_no = B.sal_no and Js.is_add = 'Y'");
            str.Append("         left join #A1 Js2 on Js2.sal_no = B.sal_no and Js2.is_add = 'N'");
	        str.Append("     where 1 = 1  and B.itm is not null  ");
            str.Append(" ) AS T   ");
            //--得出单价
            str.Append(" left join prdt_wp_tfup TUP on TUP.up_no = T.up_no and TUP.wp_no = T.wp_no   ");
            str.Append(" where 1 = 1   ");

            if (!string.IsNullOrEmpty(sqlWhere.Trim()))
            {
                str.Append("  and " + sqlWhere);
            }
            str.Append(" order by dep_no,sal_no, clc_type asc,prd_no ");

            if (GetType.ToUpper() == "A".ToUpper())
            {
                DataTable DtA = SqlHelper.ExecuteSql(str.ToString());
                return DtA;
            }

            str.Append("  ");

            str.Append(" SELECT LEFT(jx_no__,LEN(jx_no__)-1) as jx_no, LEFT(SO_NO__,LEN(SO_NO__)-1) as so_no, * INTO #A3 FROM (     ");
	        str.Append("     select (     ");
		    str.Append("         SELECT distinct jx_no+',' FROM #A2 B      ");
		    str.Append("         WHERE B.sal_no = A.sal_no and B.prd_no = A.prd_no  ");
            str.Append("             and B.wp_no = A.wp_no      ");
		    str.Append("         FOR XML PATH('')      ");
	        str.Append("     ) as jx_no__,     ");
	        str.Append("     (     ");
		    str.Append("         SELECT distinct SO_NO+',' FROM #A2 B      ");
		    str.Append("         WHERE B.sal_no = A.sal_no and B.prd_no = A.prd_no    ");
            str.Append("             and B.wp_no = A.wp_no      ");
		    str.Append("         FOR XML PATH('')      ");
	        str.Append("     ) as SO_NO__,     ");
            str.Append("     A.sal_no, A.sal_name, A.prd_no, A.prd_name, A.dep_no, A.dep_name, A.wp_no, A.wp_name,A.clc_type, A.ut, sum(isnull(A.qty,0)) as qty, up_pair, up_pic, upbug,");
            str.Append("     A.jsamt1, A.jsamt2,A.so_pic_qty,A.so_qty  ");
            str.Append(" from #A2 AS A     ");
            str.Append(" group by sal_no, sal_name, prd_no, prd_name, dep_no, dep_name, ut, wp_no,wp_name ,clc_type, up_pair, up_pic, upbug,jsamt1,jsamt2,so_pic_qty, so_qty   ");
            str.Append(" ) as St     ");
            str.Append(" where 1 = 1     ");
            //--对比
            //select * from #A2 
            //select * from #A3 
             

            //--- 3. 汇总同员工,货品、数量的行
            str.Append(" SELECT      clc_type,   ");
	        str.Append("     LEFT(jx_no__,LEN(jx_no__)-1) as jx_no,      ");
	        str.Append("     LEFT(so_no__,LEN(so_no__)-1) as so_no,      ");
	        str.Append("     LEFT(wp_no__,LEN(wp_no__)-1) as wp_no,      ");
	        str.Append("     LEFT(wp_name__,LEN(wp_name__)-1) as wp_name,      ");
            str.Append("     LEFT(up_pair_list__,LEN(up_pair_list__)-1) as up_pair_list,       ");
	        str.Append("     isnull(up_pair,1) * isnull(qty,0) as amt,     ");
	        str.Append("     sal_no, sal_name, prd_no,  prd_name,     ");
            str.Append("     ut, qty, up_pair , up_pic, cnt , dep_no, dep_name,   ");
            str.Append("     jsamt1,jsamt2 ,so_pic_qty, so_qty ");
            str.Append(" FROM (     ");

	        str.Append("     select A.sal_no, A.sal_name,       ");
	        str.Append("     A.prd_no, A.prd_name,      ");
            str.Append("     A.ut, A.qty,      ");
            str.Append("     A.clc_type,     ");
            
	        str.Append("     sum(up_pair) as up_pair,    ");
	        str.Append("     sum(up_pic) as up_pic,      ");
            str.Append("     A.jsamt1,A.jsamt2,          ");
            str.Append("     A.so_pic_qty, A.so_qty,     ");
	        str.Append("     count(1) as cnt,     ");
            str.Append("     A.dep_no, A.dep_name,   ");

	        str.Append("     (     ");
		    str.Append("         SELECT distinct jx_no+',' FROM #A3 B      ");
            str.Append("         WHERE B.sal_no = A.sal_no and B.prd_no = A.prd_no and B.qty = A.qty  and B.clc_type = A.clc_type     ");
		    str.Append("         FOR XML PATH('')      ");
	        str.Append("     ) as jx_no__,     ");
	        str.Append("     (     ");
		    str.Append("         SELECT distinct so_no+',' FROM #A3 B      ");
            str.Append("         WHERE B.sal_no = A.sal_no and B.prd_no = A.prd_no and B.qty = A.qty  and B.clc_type = A.clc_type     ");
		    str.Append("         FOR XML PATH('')      ");
	        str.Append("     ) as so_no__,     ");
	        str.Append("     (");
            str.Append("         SELECT distinct isnull(wp_no,'')+','  FROM #A3 B      ");
            str.Append("         WHERE B.sal_no = A.sal_no and B.prd_no = A.prd_no and B.qty = A.qty  and B.clc_type = A.clc_type    ");
		    str.Append("         FOR XML PATH('')      ");
	        str.Append("     ) as wp_no__,     ");
	        str.Append("     (");
            str.Append("         SELECT distinct isnull(wp_name,'错误找不到工序')+',' FROM #A3 B      ");
            str.Append("         WHERE B.sal_no = A.sal_no and B.prd_no = A.prd_no and B.qty = A.qty  and B.clc_type = A.clc_type    ");
		    str.Append("         FOR XML PATH('')      ");
	        str.Append("     ) as wp_name__,     ");
            str.Append("     (");
		    str.Append("         SELECT cast(up_pair as  varchar(20)) + '+' FROM #A3 B      ");
            str.Append("         WHERE B.sal_no = A.sal_no and B.prd_no = A.prd_no and B.qty = A.qty  and B.clc_type = A.clc_type    ");
		    str.Append("         FOR XML PATH('')      ");
	        str.Append("     ) as up_pair_list__      ");
	        str.Append("     from #A3  A      ");
            str.Append("     group by sal_no, sal_name, prd_no, prd_name,clc_type, dep_no, dep_name, ut, qty, jsamt1, jsamt2,so_pic_qty, so_qty    ");
            str.Append(" ) AS T   order by dep_no asc, sal_no asc, clc_type asc ");


            DataTable DtB = SqlHelper.ExecuteSql(str.ToString());
            return DtB;

            //if (GetType.ToUpper() == "B".ToUpper())
            //{
                
            //}
 
        }

        
    }
}
