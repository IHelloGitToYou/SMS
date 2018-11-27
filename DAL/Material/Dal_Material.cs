using SMS.DBHelper;
using SMS.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;

namespace SMS.DAL.Material
{
    public class Dal_Material
    {
        public bool Exists(int material_id)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from Material");
            strSql.Append(" where ");
            strSql.Append(" material_id = @material_id  ");
            SqlParameter[] parameters = {
                    new SqlParameter("@material_id", SqlDbType.Int)
            };
            parameters[0].Value = material_id;
            return ((int)SqlHelper.ExecuteScalar(strSql.ToString(), parameters)) <= 0 ? false : true;
        }

        public bool ExistsNo(string prd_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from Material");
            strSql.Append(" where ");
            strSql.Append(" prd_no = @prd_no  ");
            SqlParameter[] parameters = {
                    new SqlParameter("@prd_no", SqlDbType.VarChar)
            };
            parameters[0].Value = prd_no;
            return ((int)SqlHelper.ExecuteScalar(strSql.ToString(), parameters)) <= 0 ? false : true;
        }

        /// <summary>
        /// 增加一条数据
        /// </summary>
        public int Add(Model_Material model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into Material(");
            strSql.Append("  prd_no, name,price");
            strSql.Append(") values (");
            strSql.Append("  @prd_no,@name,@price");
            strSql.Append(") select @@identity");

            SqlParameter[] parameters = {
                //new SqlParameter("@material_id", SqlDbType.Int),
                new SqlParameter("@prd_no", SqlDbType.VarChar),
                new SqlParameter("@name", SqlDbType.VarChar),
                new SqlParameter("@price", SqlDbType.Decimal)
            };
            //parameters[0].Value = model.material_id;
            parameters[0].Value = model.prd_no;
            parameters[1].Value = model.name;
            parameters[2].Value = model.price;

            var obj = SqlHelper.ExecuteScalar(strSql.ToString(), parameters);
            return int.Parse(obj.ToString());
        }


        /// <summary>
        /// 更新一条数据
        /// </summary>
        public void Update(Model_Material model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("Update Material set ");
            //strSql.Append(" prd_no = @prd_no , ");
            strSql.Append(" name = @name , ");
            strSql.Append(" price = @price ");
            strSql.Append(" where  material_id = @material_id ");

            SqlParameter[] parameters = {
                new SqlParameter("@material_id", SqlDbType.Int),
                //new SqlParameter("@prd_no", SqlDbType.VarChar),
                new SqlParameter("@name", SqlDbType.VarChar),
                new SqlParameter("@price", SqlDbType.Decimal)
            };
            parameters[0].Value = model.material_id;
            //parameters[1].Value = model.prd_no;
            parameters[1].Value = model.name;
            parameters[2].Value = model.price;

            SqlHelper.ExecuteNonQuery(new SqlCommand(strSql.ToString()), parameters);
        }


        /// <summary>
        /// 删除一条数据
        /// </summary>
        public void Delete(int material_id)
        {
            /// 检查存在，客户的订单？
            if (true == CheckUsed(material_id))
            {
                throw new Exception(" 资料已占用，不能删除！！");
            }

            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from Material ");
            strSql.Append(" where material_id=@material_id ");
            SqlParameter[] parameters = {
                    new SqlParameter("@material_id", SqlDbType.VarChar,40)           };
            parameters[0].Value = material_id;

            SqlHelper.ExecuteNonQuery(new SqlCommand(strSql.ToString()), parameters);
        }

        /// <summary>
        /// 检测是否使用过
        /// </summary>
        /// <returns></returns>
        public bool CheckUsed(int material_id)
        {
            if (SqlHelper.ExecuteSql("select * from PrdtWpMaterial where material_id = " + material_id + "").Rows.Count > 0)
            {
                return true;
            }
            if (SqlHelper.ExecuteSql("select * from WPQty_B2_Material where material_id = " + material_id + "").Rows.Count > 0)
            {
                return true;
            }

            return false;
        }
    }
}
