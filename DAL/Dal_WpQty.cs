using System;
using System.Collections;
using System.Data;
using System.Data.Sql;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SMS.Model;

using System.Data.SqlClient;
using SMS.DBHelper;

namespace SMS.DAL
{
    public class Dal_WpQty
    {
        /// <summary>
        /// 返回前台的格式
        /// </summary>
        /// <param name="prd_no"></param>
        /// <param name="cus_no"></param>
        /// <param name="up_date"></param>
        /// <param name="wpdep_nos"></param>
        /// <param name="user_dep_no"></param>
        /// <param name="jx_nos"></param>
        /// <returns></returns>
        public string GetWpQtyDataWithUIFormat(string actionType, string prd_no, string cus_no, DateTime up_date, string wpdep_nos, string user_dep_no, string jx_nos
            , string so_no, string so_itm, string ut
            )
        {
            /// 取出显示的单位
            ///   注意：这样写法有问题，如果jx_nos 包含2个单就报错，
            ///     现只能选1个单显示
            if (actionType == "TableLoad".ToUpper()){
                ut = (string)SqlHelper.ExecuteScalar("select isnull(ut, 1) as ut from WPQTY_H where jx_no =" + jx_nos); 
            }
            
            //1.取当前有效的单价~~
            string MatchedUpNo = GetNowUpNo(prd_no, cus_no, up_date, user_dep_no);
            if (actionType == "TalbeCreate".ToUpper() && MatchedUpNo == "")
                throw new Exception("货品在此日期段没有对应的单价!!<br/>请选完善货品单价，避免月底核发工资为0 ");
            
            // 1.05 应产量
            Dal_MFSO dalSo = new Dal_MFSO();
            if(false == dalSo.Exists(so_no, so_itm))
                throw new Exception("订单或者订单行不存在！！" + so_no + " 行" + so_itm);

            string sql01 = " SELECT S.prd_no, isnull((isnull(S.qty,0) * 1 ),0) as max_qty, isnull(S.qty,0) * isnull(P.pic_num, 2) as max_pic_qty, P.wp_no FROM  TF_SO S  " +
                "    left join prdt_wp P on S.prd_no = P.prd_no  " +
                " where 1=1 " + (wpdep_nos.Trim() == "''" ? "" : " AND P.dep_no in(" + wpdep_nos + ") ") +
                "   AND S.so_no = '" + so_no + "' and S.itm = " + so_itm + " ";
            SqlCommand cmd01 = new SqlCommand(sql01);
            DataTable MaxQty = SqlHelper.ExecuteSearch(cmd01);

            //1.05 已完工量  
            ///  如果jx_no 不为空（即查询状态）下，过滤掉它单里的量，不然重算部份数量。
            ///  
            string sql02 = "   SELECT B.prd_no, B.wp_no,sum(isnull(B.qty,0)) as done_qty, P.itm  FROM WPQty_B B  " +
                            "       left join WPQty_H H on H.jx_no = B.jx_no   " +
                            "       left join  prdt_wp P on H.prd_no = P.prd_no and P.wp_no = B.wp_no   " +
                            "  where H.so_no = '" + so_no + "' and H.so_itm = " + so_itm + " and H.jx_no not in(" + jx_nos + ")  " +
                            "       group by   B.prd_no, B.wp_no , P.itm " +
                            "       order by   P.itm   ";
            SqlCommand cmd02 = new SqlCommand(sql02);
            DataTable DoneQty = SqlHelper.ExecuteSearch(cmd02);

            //2.工序　+　单价
            //单价为空，但也要显示其他数据。。
             string sql = " " +
            " SELECT P.*, TUP.up_no,TUP.up_pic, TUP.up_pair FROM dbo.prdt_wp P " +
            "	LEFT JOIN dbo.prdt_wp_tfup TUP ON TUP.prd_no = P.prd_no AND TUP.wp_no = P.wp_no  " +
            " WHERE P.prd_no = '" + prd_no + "'" + (wpdep_nos.Trim() == "''" ? "" : "  AND P.dep_no in(" + wpdep_nos + ") " ) + 
            " AND TUP.up_no = " + MatchedUpNo +
            "  order by P.itm asc ";

            if (MatchedUpNo == "")
                sql = " SELECT P.*,  -1 as up_pic, -1 as up_pair FROM dbo.prdt_wp P " +
            " WHERE P.prd_no = '" + prd_no + "'" + (wpdep_nos.Trim() == "''" ? "" : "  AND P.dep_no in(" + wpdep_nos + ") " )+ 
            "  order by P.itm asc ";

            SqlCommand cmd = new SqlCommand(sql);
            DataTable UpInfo = SqlHelper.ExecuteSearch(cmd);

            // 3.人员列表
            DataTable dtSalNos = GetSalmWithJK(user_dep_no, jx_nos, up_date);

            //4.原来的单据的数据，可以不指定
            DataTable dtWpQtu = GetWpQtyData(jx_nos);

            //5.最后的合并列：本行合计
            DataTable dtSumWpQty = GetWpQtySumData(jx_nos);

            //6.总计数量行


            // 转变为前台Json格式
            // 格式: 
            ///////type, value         工序1,      工序2...
            ///////         工序1单价,  工序2单价...

            //    max_qty  应产总量1 应产总量2....
            //    done_qty  已完工量1 已完工量2....

            ///////员工A    数量1,     数量2...
            ///////员工B    数量1,     数量2...
            ///////员工C   数量1,     数量2...
            ///////...    数量1,     数量2...
            ///////...    数量1,     数量2...
            ///////...    数量1,     数量2...
            //////本期合计 this_sum 合数1,    合数2....
            //////总合计 sum 合数1,    合数2....
            StringBuilder ResStr = new StringBuilder();
            ResStr.Append("[");

            StringBuilder S1 = new StringBuilder();
            StringBuilder S2 = new StringBuilder();
            StringBuilder S3 = new StringBuilder();
            StringBuilder S4 = new StringBuilder();
            StringBuilder S5 = new StringBuilder();
            StringBuilder S6 = new StringBuilder();
            StringBuilder S7 = new StringBuilder();
            StringBuilder S8 = new StringBuilder();

            string wp_no, name = "", rowName = "";
            double up_pair = 0.00, up_pic = 0.00,
                max_qty = 0.00, max_pic_qty = 0.00, done_qty = 0.00;

            int pic_num = 0;
            List<string> UpNoList = new List<string>();
            List<int> Pic_NumList = new List<int>();

            //工序 
            //工序名称
            //对单价
            //个单价
            S1.Append("{type:'wp_no', value:'" + UpInfo.Rows.Count + "',");
            S2.Append("{type:'wp_name',");
            S3.Append("{type:'up_pair',");
            S4.Append("{type:'up_pic',");
            S7.Append("{type:'pic_num',");
            S5.Append("{type:'max_qty',");
            S8.Append("{type:'max_pic_qty',");
            S6.Append("{type:'done_qty',");

            int Cnt = UpInfo.Rows.Count, index = 0;

            foreach (DataRow UpRow in UpInfo.Rows)
            {
                wp_no = UpRow["wp_no"].ToString();
                rowName = "row" + index;

                name = UpRow["name"].ToString();
                up_pair = double.Parse(UpRow["up_pair"].ToString());
                up_pic = double.Parse(UpRow["up_pic"].ToString());
                pic_num = int.Parse(UpRow["pic_num"].ToString());
                
                if (ut == "2")
                    pic_num = (pic_num <= 0 ? 2 : pic_num);
                else
                    pic_num = 1;

                max_qty = max_pic_qty = done_qty =0.00;
                
                DataRow[] MaxRows = MaxQty.Select("wp_no='" + wp_no + "'");
                DataRow[] DoneRows = DoneQty.Select("wp_no='" + wp_no + "'");
                if (MaxRows.Length > 0)
                {
                    max_qty = double.Parse(MaxRows[0]["max_qty"].ToString());
                    max_pic_qty = double.Parse(MaxRows[0]["max_pic_qty"].ToString());
                }
                if (DoneRows.Length > 0)
                    done_qty = double.Parse(DoneRows[0]["done_qty"].ToString());

                //工序列表
                UpNoList.Add(wp_no);
                Pic_NumList.Add(pic_num);
                    
                
                if (index != Cnt - 1)
                {
                    S1.Append(rowName + ":'" + wp_no + "',");
                    S2.Append(rowName + ":'" + name + "',");
                    S3.Append(rowName + ":'" + up_pair + "',");
                    S4.Append(rowName + ":'" + up_pic + "',");
                    S7.Append(rowName + ":'" + int.Parse(UpRow["pic_num"].ToString()) + "',");
                    S5.Append(rowName + ":'" + max_qty + "',");
                    S8.Append(rowName + ":'" + max_pic_qty + "',");
                    S6.Append(rowName + ":'" + done_qty + "',");
                }
                else
                {
                    S1.Append(rowName + ":'" + wp_no + "'");
                    S2.Append(rowName + ":'" + name + "'");
                    S3.Append(rowName + ":'" + up_pair + "'");
                    S4.Append(rowName + ":'" + up_pic + "'");
                    S7.Append(rowName + ":'" + int.Parse(UpRow["pic_num"].ToString()) + "'");
                    S5.Append(rowName + ":'" + max_qty + "'");
                    S8.Append(rowName + ":'" + max_pic_qty + "'");
                    S6.Append(rowName + ":'" + done_qty + "'");
                }

                ++index;
            }
            S1.Append("}");
            S2.Append("}");
            S3.Append("}");
            S4.Append("}");
            S7.Append("}");
            S5.Append("}");
            S8.Append("}");
            S6.Append("}");

            ResStr.Append(S1.ToString() + ",");
            ResStr.Append(S2.ToString() + ",");
            ResStr.Append(S3.ToString() + ",");
            ResStr.Append(S4.ToString() + ",");
            ResStr.Append(S7.ToString() + ",");
            ResStr.Append(S5.ToString() + ",");
            //ResStr.Append(S8.ToString() + ",");
            ResStr.Append(S6.ToString() + ",");

            ///////员工A    数量1,     数量2...
            string SalNo = "";
            foreach (DataRow DRow in dtSalNos.Rows)
            {
                SalNo = DRow["sal_no"].ToString();

                S1.Remove(0, S1.Length);
                S1.Append("{type:'sal_no', value:'" + SalNo + "'" + " ,sal_name :'"+ DRow["sal_name"].ToString() + "'");

                
                DataRow[] SalQtys = dtWpQtu.Select("sal_no='" + SalNo + "'", "sal_no");
                //if (SalQtys.Length <= 0)
                //    continue;

                index = 0;
                bool findedWpQty = false;
                double findedQty = 0.00;
                string TStr = "";


                foreach (string UP in UpNoList)
                {
                    rowName = "row" + index;
                    // 找找本工序有无记录
                    findedWpQty = false;
                    foreach (DataRow dr in SalQtys)
                    {
                        if (dr["wp_no"].ToString() == UP)
                        {
                            findedQty = double.Parse(dr["qty"].ToString() );
                            findedWpQty = true;
                            break;
                        }
                    }

                    //if (index != Cnt - 1)
                    //    TStr = ",";
                    //else
                    //    TStr = "";
                    TStr = ",";

                    if (findedWpQty == true)
                    {
                        S1.Append(TStr + rowName + ":" + findedQty * Pic_NumList[index] + " ");
                    }
                    else
                    {
                        S1.Append(TStr + rowName + ": 0 ");
                    }

                    ++index;

                }

                S1.Append("}");

                ResStr.Append(S1.ToString() + ",");
            }

            index = 0;
            bool HadSumData = dtSumWpQty.Rows.Count > 0;
            
            //本期合计 
            //总合计
            S1.Remove(0, S1.Length);
            S1.Append("{type : 'this_sum',");
            S2.Remove(0, S2.Length);
            S2.Append(",{type : 'sum',");

            double thisSum = 0.00;
            foreach (string UP in UpNoList)
            {
                rowName = "row" + index;
                DataRow row;
                done_qty = 0.00; thisSum = 0.00;

                DataRow[] rows = dtSumWpQty.Select(" wp_no='" + UP + "'");
                DataRow[] DoneRows = DoneQty.Select("wp_no='" + UP + "'");
                if (DoneRows.Length > 0)
                    done_qty = double.Parse(DoneRows[0]["done_qty"].ToString());


                //row = dtSumWpQty.Rows[index];
                if (rows.Length > 0)
                {
                    row = rows[0];
                    thisSum = double.Parse(row["qty"].ToString());

                    if (index != Cnt - 1)
                    {
                        S1.Append(rowName + ":'" + (thisSum * Pic_NumList[index]) + "',");
                    }
                    else
                        S1.Append(rowName + ":'" + (thisSum * Pic_NumList[index]) + "'");
                }
                else
                {
                    if (index != Cnt - 1)
                        S1.Append(rowName + ": '0' ,");
                    else
                        S1.Append(rowName + ": '0' ");
                }

                if (index != Cnt - 1)
                    S2.Append(rowName + ": '" + ((done_qty + thisSum) * Pic_NumList[index])  + "' ,");
                else
                    S2.Append(rowName + ": '" + ((done_qty + thisSum) * Pic_NumList[index] ) + "' ");


                ++index;
            }
            
            S1.Append("}");
            S2.Append("}");
            
            ResStr.Append(S1.ToString());
            ResStr.Append(S2.ToString());

            ResStr.Append("]");
            return ResStr.ToString();
        }


        public string GetNowUpNo(string prd_no, string cus_no, DateTime date,string user_dep_no)
        {
            string MatchedUpNo = "";

            StringBuilder S = new StringBuilder();

            //string Sql = "  " +
                S.Append("  select top 1 T2.up_no from (    ");
				S.Append("  select     ");
				S.Append("  	CASE     "); //---找上级部门最近的，单价组
                S.Append("  		when dep_no = '" + user_dep_no + "' then 5     ");
				S.Append("  		when isnull(dep_no,'') = '' then 0     ");
				S.Append("  		else 0     ");
				S.Append("  	end AS V1,    ");
				S.Append("  	case     ");
				S.Append("  		when (dep_no is null or dep_no = '') then len(up_road) *-1     ");
				S.Append("  	else    ");
				S.Append("  		CHARINDEX(dep_no+',', up_road) * -1 end AS V2,    ");
                S.Append("  	case WHEN cus_no = '" + cus_no + "' THEN 3      ");
				S.Append("  		WHEN ISNULL(cus_no,'') = '' THEN 0      ");
				S.Append("  		ELSE -3 end AS V3 ,    ");
				S.Append("  	T.*     ");
				S.Append("  from (    ");
				S.Append("  	SELECT      ");
				S.Append("  		HUP.*,dep.up_road     ");//--,dep.dep_no 
				S.Append("  	FROM prdt_wp_hfup HUP      ");
                S.Append("  	left join dept dep on dep.dep_no = '" + user_dep_no + "'     ");
				S.Append("  	WHERE     ");
				S.Append("  		DATEDIFF(dd,HUP.start_dd, '" + date + "') >=0     ");
                S.Append("  		AND DATEDIFF(dd,HUP.end_dd, '" + date + "') <=0       ");
        		S.Append("  		AND  HUP.prd_no = '" +prd_no + "'     ");
        		S.Append("  		AND  (HUP.dep_no = dep.dep_no or HUP.dep_no = '' or dep.up_road like '%' + HUP.dep_no+ ',%' )    ");
        		S.Append("  ) AS T    ");
        	    S.Append("  ) as T2    ");
        	    S.Append("  where V3 >= 0     ");
        	    S.Append("  ORDER  BY V1 desc,V2 desc,V3 desc    ");

            object obj = SqlHelper.ExecuteScalar(S.ToString());
            if (obj == null)
            {
                MatchedUpNo = "";
            }
            else
            {
                MatchedUpNo = obj.ToString();
            }


            return MatchedUpNo;
        }

        public string GetNowUpNo(string prd_no, string cus_no, DateTime date)
        {
            string MatchedUpNo = "";

            string Sql = "  " +
            " select  T.up_no from (SELECT  TOP 1 up_no, CASE  " +
            " 	WHEN cus_no = '" + cus_no + "' THEN 10 " +
            " 	WHEN ISNULL(cus_no,'') = '' THEN 8 " +
            " 	ELSE 2 END AS MatchValue   " +
            " FROM prdt_wp_hfup HUP " +
                //  " --LEFT JOIN dbo.prdt_wp_tfup TUP ON TUP.up_no = HUP.up_no " +
            " WHERE DATEDIFF(dd,HUP.start_dd, '" + date + "') >=0 AND DATEDIFF(dd,HUP.end_dd, '" + date + "') <=0" +
            " 	AND  HUP.prd_no = '" + prd_no + "' " +
            " ORDER  BY MatchValue DESC " +
            " ) AS T  ";

            object obj = SqlHelper.ExecuteScalar(Sql);
            if (obj == null)
            {
                MatchedUpNo = "";
            }
            else
            {
                MatchedUpNo = obj.ToString();
            }


            return MatchedUpNo;
        }

        /// <summary>
        /// 合并人员，与原来导入的单已存在的人员列表, 原因有可能人员换了部门
        /// </summary>
        /// <param name="user_dep_no"></param>
        /// <param name="jx_nos"></param>
        /// <returns></returns>
        public DataTable GetSalmWithJK(string user_dep_no, string jx_nos, DateTime jx_dd)
        {
            Dal_Dept dalDep = new Dal_Dept();
            DataTable dtDep = dalDep.GetData(" and dep_no = '" + user_dep_no + "'");
            if (dtDep.Rows.Count <= 0)
                throw new Exception("部门:"+ user_dep_no +"不存在!");

            string deptDownRoadStr = dtDep.Rows[0]["down_road"].ToString();
            List<string> deps = Common.StringToList(deptDownRoadStr, ",");
            if (deps.IndexOf(user_dep_no) < 0)
                deps.Add(user_dep_no);

            string depIn = Common.ListToSqlWhereIn(deps);

            jx_nos = string.IsNullOrEmpty(jx_nos) ? " 'XXXX不存在的代号'" : jx_nos;

            string Sql = "  " +
            " select * from (" +
            "       SELECT user_no as sal_no, name as sal_name,dep_no,sort_itm  FROM SALM where dep_no in(" + depIn + ")" + 
            "          and  isnull(out_dd,'9999/12/31') >= '"+ jx_dd.Date.ToString() + "'" +
            "	union     " +
            "       SELECT sal_no, S.name as sal_name, S.dep_no,S.sort_itm  FROM WPQty_B  " +
            "       left join SALM S on S.user_no = WPQty_B.sal_no " +
            "       where jx_no in (" + jx_nos + ") " +
            " ) AS T " +
            " order by dep_no, sort_itm";


            SqlCommand cmd = new SqlCommand(Sql);
            return SqlHelper.ExecuteSearch(cmd);
        }

        /// <summary>
        /// 单号列表
        ///   导入单的数据
        ///  如果有多单显示时，合并工序数量
        /// </summary>
        /// <param name="jx_nos"></param>
        /// <returns></returns>
        public DataTable GetWpQtyData(string jx_nos)
        {

            jx_nos = string.IsNullOrEmpty(jx_nos) ? " 'XXXX不存在的代号'" : jx_nos;

            string Sql = "  " +
                " SELECT WPQty_B.sal_no, WPQty_B.prd_no,WPQty_B.wp_no, sum(isnull(WPQty_B.qty, 0.00)) as qty FROM WPQty_B " +
                " left join  prdt_wp P on P.prd_no = WPQty_B.prd_no and P.wp_no = WPQty_B.wp_no " +

                " where jx_no in (" + jx_nos + ") " +
                " group by WPQty_B.sal_no, WPQty_B.prd_no, WPQty_B.wp_no,P.itm  " +
                " order by WPQty_B.sal_no, WPQty_B.wp_no, P.itm ";

            SqlCommand cmd = new SqlCommand(Sql);
            return SqlHelper.ExecuteSearch(cmd);
        }

        public DataTable GetWpQtySumData(string jx_nos)
        {

            jx_nos = string.IsNullOrEmpty(jx_nos) ? " 'XXXX不存在的代号'" : jx_nos;

            string Sql = "  " +
                " SELECT  WPQty_B.prd_no,WPQty_B.wp_no,sum(isnull(WPQty_B.qty, 0.00 ) ) as qty, P.itm FROM WPQty_B  " +
                "   left join  prdt_wp P on  P.prd_no = WPQty_B.prd_no and  P.wp_no = WPQty_B.wp_no " +

                " where jx_no in (" + jx_nos + ") " +
                " group by   WPQty_B.prd_no, WPQty_B.wp_no, P.itm   " +
                " order by   P.itm ";

            SqlCommand cmd = new SqlCommand(Sql);
            return SqlHelper.ExecuteSearch(cmd);
        }


        public SqlCommand HeadAdd(Model_WpQty_H HModel)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into WPQty_H(");
            strSql.Append("jx_no,jx_dd,sal_no,copy_sal_no,so_no,so_itm,prd_no,wp_dep_no,user_dep_no,ut,n_man,n_dd )");
            strSql.Append(" values (");
            strSql.Append("@jx_no,@jx_dd,@sal_no,@copy_sal_no,@so_no,@so_itm,@prd_no,@wp_dep_no,@user_dep_no,@ut,@n_man,@n_dd )");
            SqlParameter[] parameters = {
					new SqlParameter("@jx_no", SqlDbType.VarChar,40),
					new SqlParameter("@jx_dd", SqlDbType.DateTime),
					new SqlParameter("@sal_no", SqlDbType.VarChar,40),
					new SqlParameter("@copy_sal_no", SqlDbType.VarChar,40),
					new SqlParameter("@so_no", SqlDbType.VarChar,40),
					new SqlParameter("@so_itm", SqlDbType.Int,4),
					new SqlParameter("@prd_no", SqlDbType.VarChar,40),
					new SqlParameter("@wp_dep_no", SqlDbType.VarChar,40),
					new SqlParameter("@user_dep_no", SqlDbType.VarChar,40),
					new SqlParameter("@ut", SqlDbType.VarChar,2),
					new SqlParameter("@n_man", SqlDbType.VarChar,40),
					new SqlParameter("@n_dd", SqlDbType.DateTime),
                    //new SqlParameter("@e_man", SqlDbType.VarChar,40),
                    //new SqlParameter("@e_dd", SqlDbType.DateTime) 
            };
            parameters[0].Value = HModel.jx_no;
            parameters[1].Value = HModel.jx_dd;
            parameters[2].Value = HModel.sal_no;
            parameters[3].Value = HModel.copy_sal_no;
            parameters[4].Value = HModel.so_no;
            parameters[5].Value = HModel.so_itm;
            parameters[6].Value = HModel.prd_no;
            parameters[7].Value = HModel.wp_dep_no;
            parameters[8].Value = HModel.user_dep_no;
            parameters[9].Value = HModel.ut;
            parameters[10].Value = HModel.n_man;
            parameters[11].Value = DateTime.Now;
            //parameters[12].Value = HModel.e_man;
            //parameters[13].Value = HModel.e_dd;

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);

            return cmd;
        }


        public SqlCommand HeadUpdate(Model_WpQty_H HModel)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("update WPQty_H set ");
            strSql.Append("jx_dd=@jx_dd,");
            strSql.Append("sal_no=@sal_no,");
            strSql.Append("copy_sal_no=@copy_sal_no,");
            strSql.Append("so_no=@so_no,");
            strSql.Append("so_itm=@so_itm,");
            strSql.Append("prd_no=@prd_no,");
            strSql.Append("wp_dep_no=@wp_dep_no,");
            strSql.Append("user_dep_no=@user_dep_no,");
            strSql.Append("ut=@ut,");
            //strSql.Append("n_man=@n_man,");
            //strSql.Append("n_dd=@n_dd,");
            strSql.Append("e_man=@e_man,");
            strSql.Append("e_dd=@e_dd");
            strSql.Append(" where jx_no=@jx_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@jx_dd", SqlDbType.DateTime),
					new SqlParameter("@sal_no", SqlDbType.VarChar,40),
					new SqlParameter("@copy_sal_no", SqlDbType.VarChar,40),
					new SqlParameter("@so_no", SqlDbType.VarChar,40),
					new SqlParameter("@so_itm", SqlDbType.Int,4),
					new SqlParameter("@prd_no", SqlDbType.VarChar,40),
					new SqlParameter("@wp_dep_no", SqlDbType.VarChar,40),
					new SqlParameter("@user_dep_no", SqlDbType.VarChar,40),
					new SqlParameter("@ut", SqlDbType.VarChar,2),
                    //new SqlParameter("@n_man", SqlDbType.VarChar,40),
                    //new SqlParameter("@n_dd", SqlDbType.DateTime),
					new SqlParameter("@e_man", SqlDbType.VarChar,40),
					new SqlParameter("@e_dd", SqlDbType.DateTime),
					new SqlParameter("@jx_no", SqlDbType.VarChar,40)};
            parameters[0].Value = HModel.jx_dd;
            parameters[1].Value = HModel.sal_no;
            parameters[2].Value = HModel.copy_sal_no;
            parameters[3].Value = HModel.so_no;
            parameters[4].Value = HModel.so_itm;
            parameters[5].Value = HModel.prd_no;
            parameters[6].Value = HModel.wp_dep_no;
            parameters[7].Value = HModel.user_dep_no;
            parameters[8].Value = HModel.ut;
            //parameters[9].Value = HModel.n_man;
            //parameters[10].Value = HModel.n_dd;
            parameters[9].Value = HModel.e_man;
            parameters[10].Value = DateTime.Now;
            parameters[11].Value = HModel.jx_no;

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);

            return cmd;
        }

        
        public SqlCommand BodyUnitAdd(Model_WPQty_B BModel)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into WPQty_B(");
            strSql.Append("jx_no,itm,prd_no,wp_no,sal_no,qty)");
            strSql.Append(" values (");
            strSql.Append("@jx_no,@itm,@prd_no,@wp_no,@sal_no,@qty)");
            SqlParameter[] parameters = {
					new SqlParameter("@jx_no", SqlDbType.VarChar,40),
					new SqlParameter("@itm", SqlDbType.Int,4),
					new SqlParameter("@prd_no", SqlDbType.VarChar,40),
					new SqlParameter("@wp_no", SqlDbType.VarChar,40),
					new SqlParameter("@sal_no", SqlDbType.VarChar,40),
					new SqlParameter("@qty", SqlDbType.Decimal, 12)};
            parameters[0].Value = BModel.jx_no;
            parameters[1].Value = BModel.itm;
            parameters[2].Value = BModel.prd_no;
            parameters[3].Value = BModel.wp_no;
            parameters[4].Value = BModel.sal_no;
            parameters[5].Value = BModel.qty;

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);

            return cmd;
        }


        /// <summary>
        /// 删除一条数据
        /// </summary>
        public bool TableDelete(string jx_no)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();

            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from WPQty_H ");
            strSql.Append(" where jx_no=@jx_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@jx_no", SqlDbType.VarChar,40)			};
            parameters[0].Value = jx_no;

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);

            SqlCommand BodyCmd = new SqlCommand("delete WPQty_B where jx_no ='" + jx_no + "'");


            cmds.Add(cmd);
            cmds.Add(BodyCmd);

            return SqlHelper.ExecuteTransWithCollections(cmds);
        }


        public bool TableAdd(Model_WpQty_H HModel, List<Model_WPQty_B> BModels)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();
            cmds.Add(HeadAdd(HModel));
            
            foreach( Model_WPQty_B bmodel in BModels){
                cmds.Add(BodyUnitAdd(bmodel));
            }

            // 统计完工量  末做


            return SqlHelper.ExecuteTransWithCollections(cmds);
        }

        public bool TableUpdate(Model_WpQty_H HModel, List<Model_WPQty_B> BModels)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();
            cmds.Add(HeadUpdate(HModel));

            //表身先删除后增加
            SqlCommand BodyCmd = new SqlCommand("delete WPQty_B where jx_no ='" + HModel.jx_no + "'");
            cmds.Add(BodyCmd);

            foreach (Model_WPQty_B bmodel in BModels)
            {
                cmds.Add(BodyUnitAdd(bmodel));
            }

            // 统计完工量  末做
            return SqlHelper.ExecuteTransWithCollections(cmds);
        }

        public DataTable SearchTable(string StrWhere)
        {
            StringBuilder strSql = new StringBuilder();

            strSql.Append("     select * from (     ");
            strSql.Append("     select P.name as prd_name, S.name as sal_name,      ");
            strSql.Append("     	DP.name as wp_dep_name ,     ");
            strSql.Append("     	DP2.name as user_dep_name ,     ");
            strSql.Append("     	S2.name as n_man_name,     ");
            strSql.Append("     	S3.name as e_man_name,     ");
            ////////strSql.Append("     	WPQty_H.*      ");
            strSql.Append("         WPQty_H.jx_no,convert(varchar(100), WPQty_H.jx_dd, 111) as jx_dd, WPQty_H.sal_no,WPQty_H.copy_sal_no,WPQty_H.so_no,WPQty_H.so_itm,WPQty_H.prd_no,WPQty_H.wp_dep_no,WPQty_H.user_dep_no,WPQty_H.ut,");
            strSql.Append("         WPQty_H. n_man, convert(varchar(100), WPQty_H.n_dd, 111) as n_dd, ");
            strSql.Append("         WPQty_H. e_man, convert(varchar(100), WPQty_H.e_dd, 111) as e_dd  ");

            strSql.Append("     from WPQty_H      ");
            strSql.Append("     left join prdt P  ON P.prd_no = WPQty_H.prd_no     ");
            strSql.Append("     LEFT JOIN MF_SO SO on So.so_no = WPQty_H.so_no     ");
            strSql.Append("     LEFT JOIN CUST C ON C.cus_no = So.cus_no     ");
            strSql.Append("     LEFT JOIN SALM S ON S.user_no = WPQty_H.sal_no     ");
            strSql.Append("     LEFT JOIN DeptWp DP on DP.dep_no = WPQty_H.wp_dep_no      ");
            strSql.Append("     LEFT JOIN Dept DP2 on DP2.dep_no = WPQty_H.user_dep_no      ");

            strSql.Append("     LEFT JOIN SALM S2 ON S2.user_no = WPQty_H.n_man     ");
            strSql.Append("     LEFT JOIN SALM S3 ON S3.user_no = WPQty_H.e_man     ");
            strSql.Append("     )      ");
            strSql.Append("     as T     ");


            if (StrWhere.Trim() != "")
            {
                strSql.Append(" where " + StrWhere);
            }
            strSql.Append(" order by jx_dd desc, n_dd desc  ");


            return SqlHelper.ExecuteSql(strSql.ToString());


        }

        public bool IsExsist(string jx_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("     select top 10 * from  WPQty_H where jx_no ='" + jx_no + "'  ");

            DataTable dt = SqlHelper.ExecuteSql(strSql.ToString());
            return dt.Rows.Count > 0 ? true : false;
        }
    }
}