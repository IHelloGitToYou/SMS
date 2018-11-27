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
    public class Dal_PJ_Qty
    {
        /// <summary>
        /// 增加一条数据
        /// </summary>
        public SqlCommand AddCmd(Model_PJQty_H HModel)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into PJ_Head(");
            strSql.Append("   pj_dd,pj_no,plan_id, plan_no,user_dep_no ,wp_dep_no, sal_no, prd_no,  n_man,n_dd,e_man,e_dd");
            strSql.Append(") values (");
            strSql.Append("   @pj_dd,@pj_no,@plan_id, @plan_no ,@user_dep_no,@wp_dep_no, @sal_no, @prd_no, @n_man,@n_dd,@e_man,@e_dd");
            strSql.Append(") ");

            SqlParameter[] parameters = {
			    //SqlHelper.MakeParamYao("@pj_id", SqlDbType.Int, HModel.pj_id ) ,            
                SqlHelper.MakeParamYao("@pj_dd", SqlDbType.DateTime, HModel.pj_dd ) ,            
                SqlHelper.MakeParamYao("@pj_no", SqlDbType.VarChar, HModel.pj_no ) ,            
                SqlHelper.MakeParamYao("@plan_id", SqlDbType.VarChar , HModel.plan_id ) ,
                SqlHelper.MakeParamYao("@plan_no", SqlDbType.VarChar , HModel.plan_no ) ,
                SqlHelper.MakeParamYao("@user_dep_no", SqlDbType.VarChar , HModel.user_dep_no ) ,
                SqlHelper.MakeParamYao("@wp_dep_no", SqlDbType.VarChar , HModel.wp_dep_no ) ,
                SqlHelper.MakeParamYao("@sal_no", SqlDbType.VarChar , HModel.sal_no ) ,

                //SqlHelper.MakeParamYao("@size_id", SqlDbType.Int , HModel.size_id ) ,
                //SqlHelper.MakeParamYao("@size", SqlDbType.VarChar , HModel.size ) ,
                SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar , HModel.prd_no ) ,
                
                SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar, -1 , HModel.n_man) ,            
                SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , HModel.n_dd ) ,            
                SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar,-1 , HModel.e_man) ,            
                SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , HModel.e_dd )
            }; 	

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);
            return cmd;
		}

        
        /// <summary>
        /// 更新一条数据
        /// </summary>
        public SqlCommand UpdateCmd(Model_PJQty_H HModel)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("update PJ_Head set ");
            strSql.Append(" pj_dd = @pj_dd , ");
            strSql.Append(" pj_no = @pj_no , ");

            strSql.Append(" plan_id = @plan_id, ");
            strSql.Append(" plan_no = @plan_no, ");
            strSql.Append(" user_dep_no = @user_dep_no, ");
            strSql.Append(" wp_dep_no = @wp_dep_no, ");
            strSql.Append(" sal_no = @sal_no, ");
            //strSql.Append(" size_id = @size_id, ");
            //strSql.Append(" size = @size, ");
            strSql.Append(" prd_no = @prd_no, ");
            
            strSql.Append(" e_man = @e_man , ");
            strSql.Append(" e_dd = @e_dd  ");
            strSql.Append(" where  pj_no = @pj_no ");

            SqlParameter[] parameters = {
                SqlHelper.MakeParamYao("@pj_dd", SqlDbType.DateTime, HModel.pj_dd ) ,
                SqlHelper.MakeParamYao("@pj_no", SqlDbType.VarChar, HModel.pj_no ) ,
                SqlHelper.MakeParamYao("@plan_id", SqlDbType.VarChar , HModel.plan_id ) ,
                SqlHelper.MakeParamYao("@plan_no", SqlDbType.VarChar , HModel.plan_no ) ,
                SqlHelper.MakeParamYao("@user_dep_no", SqlDbType.VarChar , HModel.user_dep_no ) ,
                SqlHelper.MakeParamYao("@wp_dep_no", SqlDbType.VarChar , HModel.wp_dep_no ) ,
                SqlHelper.MakeParamYao("@sal_no", SqlDbType.VarChar , HModel.sal_no ) ,

                //SqlHelper.MakeParamYao("@size_id", SqlDbType.Int , HModel.size_id ) ,
                //SqlHelper.MakeParamYao("@size", SqlDbType.VarChar , HModel.size ) ,
                SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar , HModel.prd_no ) ,
                
                SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar , HModel.e_man) ,
                SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , HModel.e_dd )
            };
            SqlCommand cmd = new SqlCommand(strSql.ToString());

            cmd.Parameters.AddRange(parameters);
            return cmd;
        }

        public SqlCommand DeleteHeadCmd(string pj_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from PJ_Head ");
            strSql.Append(" where pj_no=@pj_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@pj_no", SqlDbType.VarChar,40) 
			};
            parameters[0].Value = pj_no;

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);
            return cmd;
        }

        /// <summary>
        /// 增加一条数据
        /// </summary>
        public SqlCommand BodyAddCmd(Model_PJQty_B BModel)
        {
            //strSql.Append(" wp_no = @wp_no, ");  ,
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into PJ_Body(");
            strSql.Append("  pj_no, sort,itm, prd_no, wp_no, worker, material_grade, wp_qty_pair,wp_qty_pic, wl_qty,back_good_qty, back_broken_qty , std_price, std_unit_pre, std_qty, price, unit_pre, qty, amt,ajust_std_unit, is_bad_wl,size_id,size ");
            strSql.Append(") values (");
            strSql.Append(" @pj_no,@sort,@itm,@prd_no, @wp_no, @worker, @material_grade, @wp_qty_pair,@wp_qty_pic, @wl_qty,@back_good_qty, @back_broken_qty, @std_price, @std_unit_pre, @std_qty, @price, @unit_pre ,@qty,@amt,@ajust_std_unit, @is_bad_wl,@size_id,@size ");
            strSql.Append(") ");
            // pj_id,sort,itm,material_grade,worker,wp_qty_pair,wp_qty_pic, wl_qty,back_good_qty, back_broken_qty , std_price, std_unit_pre, std_qty
            // price, unit_pre ,qty,amt
            SqlParameter[] parameters = {
                SqlHelper.MakeParamYao("@pj_no", SqlDbType.VarChar , BModel.pj_no ) ,
                SqlHelper.MakeParamYao("@sort", SqlDbType.Int , BModel.sort ) ,
                SqlHelper.MakeParamYao("@itm", SqlDbType.Int, BModel.itm ) ,

                SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar, BModel.prd_no),
                SqlHelper.MakeParamYao("@wp_no", SqlDbType.VarChar, BModel.wp_no),
                SqlHelper.MakeParamYao("@worker", SqlDbType.VarChar, BModel.worker ) ,

                SqlHelper.MakeParamYao("@material_grade", SqlDbType.VarChar, BModel.material_grade ) ,
                SqlHelper.MakeParamYao("@wp_qty_pair", SqlDbType.Decimal, BModel.wp_qty_pair ) ,
                SqlHelper.MakeParamYao("@wp_qty_pic", SqlDbType.Decimal, BModel.wp_qty_pic ) ,


                SqlHelper.MakeParamYao("@wl_qty", SqlDbType.Decimal, BModel.wl_qty ) ,
                SqlHelper.MakeParamYao("@back_good_qty", SqlDbType.Decimal, BModel.back_good_qty ) ,
                SqlHelper.MakeParamYao("@back_broken_qty", SqlDbType.Decimal, BModel.back_broken_qty ) ,
                SqlHelper.MakeParamYao("@std_price", SqlDbType.Decimal, BModel.std_price ) ,
                SqlHelper.MakeParamYao("@std_unit_pre", SqlDbType.Decimal, BModel.std_unit_pre ) ,
                SqlHelper.MakeParamYao("@std_qty", SqlDbType.Decimal, BModel.std_qty ) ,

                SqlHelper.MakeParamYao("@price", SqlDbType.Decimal, BModel.price),
                SqlHelper.MakeParamYao("@unit_pre", SqlDbType.Decimal, BModel.unit_pre ) ,
                SqlHelper.MakeParamYao("@qty", SqlDbType.Decimal, BModel.qty ),
                SqlHelper.MakeParamYao("@amt", SqlDbType.Decimal, BModel.amt ),
                SqlHelper.MakeParamYao("@ajust_std_unit", SqlDbType.Decimal, BModel.ajust_std_unit ),
                SqlHelper.MakeParamYao("@is_bad_wl", SqlDbType.VarChar, BModel.is_bad_wl.ToString().ToLower() ),
                SqlHelper.MakeParamYao("@size_id", SqlDbType.Int , BModel.size_id ) ,
                SqlHelper.MakeParamYao("@size", SqlDbType.VarChar, BModel.size )
                
            };

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);
            return cmd;
        }

        public SqlCommand DeleteBodyCmd(string pj_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from PJ_Body ");
            strSql.Append(" where pj_no=@pj_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@pj_no", SqlDbType.VarChar) 
			};
            parameters[0].Value = pj_no;

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);
            return cmd;
        }

        private DataTable GetHead(string pj_no)
        {
            //pj_dd,pj_no,plan_id, plan_no,user_dep_no ,size_id ,size, wp_no,  n_man,n_dd,e_man,e_dd
            return SqlHelper.ExecuteSql(" select "+
            " PJ_Head.pj_no, " +
            " convert(varchar(100), PJ_Head.pj_dd, 111) as pj_dd, " +
            " PJ_Head.pj_no, " +
            " PJ_Head.plan_id, " +
            " PJ_Head.plan_no, " +
            " PJ_Head.user_dep_no, " +
            " PJ_Head.wp_dep_no, " +
            " PJ_Head.sal_no, " +
            
            " PJ_Head.prd_no, " +
            " PJ_Head.n_man, " +
	        " convert(varchar(100), PJ_Head.n_dd, 111) as n_dd,  "+
	        " PJ_Head.e_man,  "+
	        " convert(varchar(100), PJ_Head.e_dd, 111) as e_dd  "+
            " from PJ_Head " +
            " where pj_no ='" + pj_no + "' ");
        }

        private DataTable GetBody(string pj_no)
        {
            // pj_id,sort,itm,material_grade,worker,wp_qty_pair,wp_qty_pic, wl_qty,back_good_qty, back_broken_qty , std_price, std_unit_pre, std_qty
            // price, unit_pre ,qty,amt
            return SqlHelper.ExecuteSql(@"  select 
                        b.pj_no,b.sort,b.itm,
                        b.wp_no, w.name as wp_name, 
                        b.worker, b.material_grade, b.wp_qty_pair,b.wp_qty_pic, b.wl_qty,b.back_good_qty, b.back_broken_qty, 
                        b.std_price, b.std_unit_pre, b.std_qty,
                        b.price, b.unit_pre ,b.qty, b.amt, ajust_std_unit,is_bad_wl,
	                    b.size, b.size_id, S.color_id
                    from PJ_Body b
                    left join Prdt_Wp W on W.prd_no = b.prd_no and W.wp_no = b.wp_no 
                    left join PJ_Head H on H.pj_no = b.pj_no 
                    left join WorkPlan_Sizes S on S.plan_id = H.plan_id AND  S.size_id = b.size_id 
                    where b.pj_no ='" + pj_no + "' ");
        }


        public bool TableAdd(Model_PJQty_H HModel)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();

            Cmds.Add( AddCmd(HModel));
            foreach (Model_PJQty_B bm in HModel.Body)
            {
                Cmds.Add( BodyAddCmd(bm) );
            }

            return SqlHelper.ExecuteTransWithCollections(Cmds);
        }

        public bool TableUpdate(Model_PJQty_H HModel)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();

            Cmds.Add(UpdateCmd(HModel));

            Cmds.Add(DeleteBodyCmd(HModel.pj_no));
            foreach (Model_PJQty_B bm in HModel.Body)
            {
                Cmds.Add(BodyAddCmd(bm));
            }

            return SqlHelper.ExecuteTransWithCollections(Cmds);
        }

        public bool TableDelete(string pj_no)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();
            Cmds.Add(DeleteBodyCmd(pj_no));
            Cmds.Add(DeleteHeadCmd(pj_no));
            return SqlHelper.ExecuteTransWithCollections(Cmds);
        }
         

        /// <summary>
        /// 取已报皮奖 数量
        /// </summary>
        /// <param name="size_id"></param>
        /// <param name="wp_dep_no"></param>
        /// <param name="user_dep_no"></param>
        /// <returns></returns>
        public DataTable GetPJQty(int size_id, string exceptPJNo)
        {
            string sql = @"
                 select 
                    B.size_id, B.worker, B.wp_no, P.prd_no, P.name as wp_name, 
                    sum(isnull(B.wp_qty_pair,0)) as done_pair,sum(isnull(B.wp_qty_pic,0)) as done_pic 
                 from PJ_Body  B
                 LEFT JOIN PJ_Head H ON H.pj_no = B.pj_no
                 LEFT JOIN PRDT_WP P on P.prd_no = H.prd_no AND P.wp_no = B.wp_no 
	             LEFT JOIN SALM S ON S.user_no = B.worker
                 where 1=1 and P.save_material_award = 'true' {0}
                 group by B.size_id, B.worker,  P.prd_no, B.wp_no, P.name";

            string sqlWhere = " And B.size_id = " + size_id;
            if (!string.IsNullOrEmpty(exceptPJNo))
            {
                sqlWhere += " And B.pj_no <> '" + exceptPJNo.Trim() + "'";
            }
            
            return string.Format(sql, sqlWhere).SearchDB();
        }


        /// <summary>
        /// 获取记录总数
        /// </summary>
        public int GetRecordCount(string strWhere)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) FROM PJ_Head ");
            if (strWhere.Trim() != "")
            {
                strSql.Append(" where " + strWhere);
            }
            object obj = SqlHelper.ExecuteScalar(strSql.ToString());
            if (obj == null)
            {
                return 0;
            }
            else
            {
                return Convert.ToInt32(obj);
            }
        }
        /// <summary>
        /// 分页获取数据列表
        /// </summary>
        public DataTable GetListByPage(string strWhere, string orderby, int startIndex, int endIndex)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("SELECT * FROM ( ");
            strSql.Append(" SELECT ROW_NUMBER() OVER (");
            if (!string.IsNullOrEmpty(orderby.Trim()))
            {
                strSql.Append("order by T." + orderby);
            }
            else
            {
                strSql.Append("order by pj_dd desc");
            }
            strSql.Append(")AS Row,  " +
            //" T.pj_id, " +
           " convert(varchar(100), T.pj_dd, 111) as pj_dd, " +
           " T.pj_no, " +
           " T.plan_id, " +
           " T.plan_no, " +
           " T.user_dep_no, " +
           " T.prd_no, " +
           " T.sal_no, " +

           " T.n_man, " +
           " convert(varchar(100), T.n_dd, 111) as n_dd,  " +
           " T.e_man,  " +
           " convert(varchar(100), T.e_dd, 111) as e_dd  ") ;

            strSql.Append("from PJ_Head T  ");

            if (!string.IsNullOrEmpty(strWhere.Trim()))
            {
                strSql.Append(" WHERE " + strWhere);
            }
            strSql.Append(" ) TT");
            if (startIndex >= 0)
                strSql.AppendFormat(" WHERE TT.Row between {0} and {1}", startIndex, endIndex);

            strSql.Append(" order by pj_dd desc");
            return SqlHelper.ExecuteSql(strSql.ToString());
        }




        public List<DataTable> GetTableData(string js_no)
        {
            List<DataTable> dts = new List<DataTable>();

            dts.Add(GetHead(js_no));

            dts.Add(GetBody(js_no));

            return dts;
        }


      //  /// <summary>
      //  /// 报告数据
      //  /// </summary>
      //  /// <param name="sqlWhere"></param>
      //  /// <returns></returns>
      //  public DataTable GetReportData(string sqlWhere)
      //  {
      //      StringBuilder strSql = new StringBuilder();
      //      strSql.Append("  select * from (");
      //      strSql.Append(" select convert(varchar(100), A.js_dd, 111) as js_dd, A.sal_no as hsal_no,S2.name as hsal_name, S.name as sal_name,D.dep_no, D.name as dep_name, B.* from PJ_Head A ");
      //      strSql.Append(" LEFT JOIN JSQty_B B ON B.JS_NO = A.JS_NO  ");
      //      strSql.Append(" LEFT JOIN salm S on S.user_no = B.sal_no  ");
      //      strSql.Append(" LEFT JOIN salm S2 on S.user_no = A.sal_no  "); //表头的数据责任者
      //      strSql.Append(" LEFT JOIN Dept D on D.dep_no = S.dep_no  ");
      //      strSql.Append("  ) as TABLEA ");

      //      if (string.IsNullOrEmpty(sqlWhere) == false)
      //          strSql.Append("  where " + sqlWhere);
      //      return SqlHelper.ExecuteSql(strSql.ToString());

      //          //strSql.Append("   where A.js_dd >= '2014-01-01' and A.js_dd <= '2014-01-31'  ");
      //  }

      //  /// <summary>
      //  /// 汇总数量，依员工，是否附加分类汇总
      //  /// </summary>
      //  /// <param name="sqlWhere"></param>
      //  /// <returns></returns>
      //  public DataTable GetReportSumQty(string sqlWhere)
      //  {
      //      StringBuilder strSql = new StringBuilder();
      //      strSql.Append(" select sal_no, is_add, sum(amt) as amt into #A1 from (  ");
	     //   strSql.Append("     select * from (  ");
      //      strSql.Append("         select convert(varchar(100), A.js_dd, 111) as js_dd, S.name as sal_name,D.dep_no,D.name as dep_name,B.* from PJ_Head A  ");
		    //strSql.Append("         LEFT JOIN JSQty_B B ON B.JS_NO = A.JS_NO   ");
		    //strSql.Append("         LEFT JOIN salm S on S.user_no = B.sal_no   ");
		    //strSql.Append("         LEFT JOIN Dept D on D.dep_no = S.dep_no   ");
	     //   strSql.Append("     ) as TIn  ");
	     //   strSql.Append("     where 1 = 1  ");
      //      strSql.Append(" ) AS T  ");
      //      strSql.Append(" group by sal_no,is_add  ");


      //      if (string.IsNullOrEmpty(sqlWhere) == false)
      //          strSql.Append("  where " + sqlWhere);
      //      return SqlHelper.ExecuteSql(strSql.ToString());
      //  }
    }
}

