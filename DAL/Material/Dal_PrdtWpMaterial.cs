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
    public class Dal_PrdtWpMaterial
    {
        //public int wm_id { get; set; }
        //public string prd_no { get; set; }
        //public string wp_no { get; set; }
        //public int material_id { get; set; }

        public int AddHeadCmd(Model_PrdtWpMaterial model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into PrdtWpMaterial(");
            strSql.Append("  prd_no, wp_no,material_id");
            strSql.Append(") values (");
            strSql.Append("  @prd_no,@wp_no,@material_id");
            strSql.Append(") select @@identity");

            SqlParameter[] parameters = {
                new SqlParameter("@prd_no", SqlDbType.VarChar),
                new SqlParameter("@wp_no", SqlDbType.VarChar),
                new SqlParameter("@material_id", SqlDbType.Int)
            };

            //parameters[0].Value = model.material_id;
            parameters[0].Value = model.prd_no;
            parameters[1].Value = model.wp_no;
            parameters[2].Value = model.material_id;

            //var cmd = new SqlCommand(strSql.ToString());
            //cmd.Parameters.AddRange(parameters);
            //return cmd;
            object obj=  SqlHelper.ExecuteScalar(strSql.ToString(), parameters);
            return int.Parse(obj.ToString());
        }

        public SqlCommand AddBodySizeCmd(Model_PrdtWpMaterialSize model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into PrdtWpMaterialSize(");
            strSql.Append("  wm_id, size,use_unit");
            strSql.Append(") values (");
            strSql.Append("  @wm_id,@size,@use_unit");
            strSql.Append(") select @@identity");

            SqlParameter[] parameters = {
                new SqlParameter("@wm_id", SqlDbType.Int),
                new SqlParameter("@size", SqlDbType.VarChar),
                new SqlParameter("@use_unit", SqlDbType.Decimal)
            };

            //parameters[0].Value = model.material_id;
            parameters[0].Value = model.wm_id;
            parameters[1].Value = model.size;
            parameters[2].Value = model.use_unit;

            var cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);
            return cmd;

            //SqlHelper.ExecuteNonQuery(cmd);
        }

     
        //public int wms_id { get; set; }
        //public int wm_id { get; set; }
        //public string size { get; set; }
        //public decimal use_unit { get; set; }
    }
}
