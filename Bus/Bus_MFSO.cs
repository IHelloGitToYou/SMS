using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using SMS.Model;
using SMS.DAL;
using SMS.DBHelper;
using SMS.DBHelper.Utility;

namespace SMS.Bus
{
    public class Bus_MFSO
    {
        private readonly Dal_MFSO dal = new Dal_MFSO();

        public bool Exists(string so_no)
        {
            return dal.Exists(so_no);
        }

        public bool Exists(string so_no, string so_itm)
        {
            return dal.Exists(so_no, so_itm);
        }



        //public bool Add(Model_MFSO model)
        //{
        //    return dal.Add(model);
        //}

        public SqlCommand Update(Model_MFSO model)
        {
            return dal.Update(model);
        }

        public DataTable GetList(string strWhere, string orderby)
        {
            return dal.GetList(strWhere, orderby);
          
        }

        public DataTable GetMF_WithTF(string strWhere, string orderby, int startIndex, int endIndex)
        {
            return dal.GetMF_WithTF(strWhere, orderby, startIndex, endIndex);
        }

       
        
        public bool TableAdd(Model_MFSO model, List<Model_TFSO> TModels)
        {
            if (Exists(model.so_no) == true)
                throw new Exception("单号已经使用过！单号必须要唯一");
            return dal.TableAdd(model, TModels);
        }

        public bool TableUpdate(Model_MFSO model, List<Model_TFSO> TModels)
        {
            return dal.TableUpdate(model, TModels);
        }

        public bool TableDelete(string so_no )
        {
            if (true == dal.CheckUsed(so_no))
                throw new Exception(" 后续生产资料已占用，不能删除！！");

            return dal.TableDelete(so_no);
        }
        

        public bool CheckRowUsed(string so_no, int itm)
        {
            return dal.CheckRowUsed(so_no, itm);
        }

        public List<DataTable> GetTableData(string so_no)
        {
            string sWhere = " so_no = '" + so_no + "'";
            List<DataTable> dts = new List<DataTable>();

            dts.Add(dal.HeadGetList(sWhere));
            dts.Add(dal.BodyGetList(sWhere));

            return dts;
        }

        

    }
}
