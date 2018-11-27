using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using SMS.Model;
using SMS.DAL;
namespace SMS.Bus
{
    public class Bus_WpQty
    {
        public readonly Dal_WpQty dal = new Dal_WpQty();

        public string GetWpQtyDataWithUIFormat(string actionType, string prd_no, string cus_no, DateTime up_date, string wpdep_nos, string user_dep_no, string jx_nos
             , string so_no, string so_itm, string ut)
        {
            return dal.GetWpQtyDataWithUIFormat(actionType, prd_no, cus_no, up_date, wpdep_nos, user_dep_no, jx_nos, so_no, so_itm,ut);
        }

        public bool TableAdd(Model_WpQty_H HModel, List<Model_WPQty_B> BModels)
        {
            return dal.TableAdd(HModel, BModels);
        }

        public bool TableUpdate(Model_WpQty_H HModel, List<Model_WPQty_B> BModels)
        {
            return dal.TableUpdate(HModel, BModels);
        }

        public bool TableDelete(string jx_no)
        {
            return dal.TableDelete(jx_no);
        }

        public DataTable SearchTable(string StrWhere)
        {
            return dal.SearchTable(StrWhere);
        }

        public string GetNowUpNo(string prd_no, string cus_no, DateTime date)
        {
            return dal.GetNowUpNo(prd_no, cus_no, date);
        }

        public bool IsExsist(string jx_no)
        {
            return dal.IsExsist(jx_no);
        }
    }
}
