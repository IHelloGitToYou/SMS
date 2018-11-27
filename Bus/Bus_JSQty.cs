using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using SMS.Model;
using SMS.DAL;

namespace SMS.Bus
{
    public class Bus_JSQty
    {
        private readonly Dal_JSQty dal = new Dal_JSQty();


        public DataTable GetListByPage(string strWhere, string orderby, int startIndex, int endIndex)
        {
            return dal.GetListByPage(strWhere, orderby, startIndex, endIndex);
        }

        public int GetRecordCount(string strWhere )
        {
            return dal.GetRecordCount(strWhere );
        }


        public bool TableAdd(Model_JSQty_H model, List<Model_JSQty_B> TModels)
        {
            return dal.TableAdd(model, TModels);
        }

        public bool TableUpdate(Model_JSQty_H model, List<Model_JSQty_B> TModels)
        {
            return dal.TableUpdate(model, TModels);
        }

        public bool TableDelete(string js_no)
        {
            return dal.TableDelete(js_no);
        }

        public List<DataTable> GetTableData(string js_no)
        {
            return dal.GetTableData(js_no);
        }

        public DataTable GetReportData(string sqlWhere)
        {
            return dal.GetReportData(sqlWhere);
        }

        public DataTable GetReportSumQty(string sqlWhere)
        {
            return dal.GetReportSumQty(sqlWhere);
        }


        
    }
}
