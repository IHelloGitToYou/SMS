using SMS.DAL.Material;
using SMS.DBHelper;
using SMS.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace SMS.Bus.SYS.Material
{
    public class Bus_Material
    {
        private readonly Dal_Material dal = new Dal_Material();
        public Bus_Material()
        {

        }
        public bool Exists(int material_id)
        {
            return dal.Exists(material_id);
        }

        public int Add(Model_Material model)
        {
            if (dal.ExistsNo(model.prd_no))
            {
                throw new Exception("编号("+ model.prd_no + ")已使用!");
            }

           return dal.Add(model);
        }

        public void Update(Model_Material model)
        {
            dal.Update(model);
        }

        public void Delete(int material_id)
        {
            dal.Delete(material_id);
        }


        public DataTable Load(string prd_no, string name)
        {
            string sql = " select material_id, prd_no, name, price from Material where 1=1 ";
            if (!string.IsNullOrEmpty(prd_no))
            {
                sql += "  and prd_no like '%" + prd_no + "%'";
            }

            if (!string.IsNullOrEmpty(name)) {
                sql += " and name like '%"+ name + "%' ";
            }

            sql += " order by prd_no ";
            return SqlHelper.ExecuteSql(sql);
        }


        public static decimal GetPrice(int material_id)
        {
            string sql = "select  price from Material where 1=1 and material_id =  " + material_id;
            var dt = SqlHelper.ExecuteSql(sql);
            if(dt.Rows.Count <= 0)
            {
                return 0;

            }
            else
            {
                return Common.BusComm.GetDouble(dt.Rows[0]["price"].ToString());
            }
        }

    }
}
