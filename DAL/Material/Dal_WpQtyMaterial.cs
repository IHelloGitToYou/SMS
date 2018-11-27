using SMS.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
namespace SMS.DAL.Material
{
    public class Dal_WpQtyMaterial
    {
        
        public SqlCommand AddMaterialCmd(Model_WPQtyMaterial model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into WPQty_H2_Material(");
            strSql.Append("  wq_id, material_id,plan_qty, wl_qty, rl_qty, use_qty, qty, price ");
            strSql.Append(") values (");
            strSql.Append("  @wq_id,@material_id,@plan_qty, @wl_qty, @rl_qty, @use_qty, @qty, @price ");
            strSql.Append(") select @@identity");

            SqlParameter[] parameters = {
                //new SqlParameter("@material_id", SqlDbType.Int),
                new SqlParameter("@wq_id", SqlDbType.Int),
                new SqlParameter("@material_id", SqlDbType.Int),
                new SqlParameter("@plan_qty", SqlDbType.Decimal),
                new SqlParameter("@wl_qty", SqlDbType.Decimal),
                new SqlParameter("@rl_qty", SqlDbType.Decimal),
                new SqlParameter("@use_qty", SqlDbType.Decimal),
                new SqlParameter("@qty", SqlDbType.Decimal),
                new SqlParameter("@price", SqlDbType.Decimal),
            };

            //parameters[0].Value = model.material_id;
            parameters[0].Value = model.wq_id;
            parameters[1].Value = model.material_id;
            parameters[2].Value = model.plan_qty;
            parameters[3].Value = model.wl_qty;
            parameters[4].Value = model.rl_qty;
            parameters[5].Value = model.use_qty;
            parameters[6].Value = model.qty;
            parameters[7].Value = model.price;

            var cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);
            return cmd;
        }


        public SqlCommand AddShareMaterialCmd(Model_WpQtyShareMaterial model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into WPQty_H2_ShareMaterial(");
            strSql.Append("    wq_id, itm, worker, share_percent ");
            strSql.Append(") values (");
            strSql.Append("    @wq_id,@itm, @worker, @share_percent ");
            strSql.Append(") select @@identity");

            SqlParameter[] parameters = {
                //new SqlParameter("@material_id", SqlDbType.Int),
                new SqlParameter("@wq_id", SqlDbType.Int),
                new SqlParameter("@itm", SqlDbType.Int),
                new SqlParameter("@worker", SqlDbType.VarChar),
                new SqlParameter("@share_percent", SqlDbType.Decimal),
            };

            //parameters[0].Value = model.material_id;
            parameters[0].Value = model.wq_id;
            parameters[1].Value = model.itm;
            parameters[2].Value = model.worker;
            parameters[3].Value = model.share_percent;

            var cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);
            return cmd;
        }


    }


}
