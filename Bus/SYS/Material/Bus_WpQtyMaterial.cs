using SMS.DAL.Material;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
 
using SMS.DBHelper;
using SMS.Model;
using System.Data.SqlClient;
using System.Data;
using System.Linq;

namespace SMS.Bus.SYS.Material
{
    public class Bus_WpQtyMaterial
    {
        Dal_WpQtyMaterial Dal = new Dal_WpQtyMaterial();
        
        public List<SqlCommand> InsertShareMaterialCmds(int wq_id, string worker1, string worker2, decimal sharePre1, decimal sharePre2)
        {
            //var allWQs = LoadShareMaterial(wq_id);
            List<SqlCommand> Cmds = new List<SqlCommand>();
            Cmds.Add(DelateShareMaterial(wq_id));

            Cmds.AddRange(GenerateShareData(wq_id, worker1, worker2, sharePre1, sharePre2));

            return Cmds;
        }

        List<SqlCommand> GenerateShareData(int wq_id, string worker1, string worker2, decimal sharePre1, decimal sharePre2)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();
            
            if((sharePre1 + sharePre2) != 100)
            {
                throw new Exception("皮奖总比率不为100");
            }
            if (string.IsNullOrEmpty(worker1))
            {
                throw new Exception("皮奖主手必须选择");
            }
            Model_WpQtyShareMaterial share1 = new Model_WpQtyShareMaterial();
            share1.wq_id = wq_id;
            share1.itm = 0;
            share1.worker = worker1;
            share1.share_percent = sharePre1;

            SqlCommand insertCmd = Dal.AddShareMaterialCmd(share1);
            Cmds.Add(insertCmd);
            if (!string.IsNullOrEmpty(worker2) && sharePre2 >0)
            {
                Model_WpQtyShareMaterial share2 = new Model_WpQtyShareMaterial();
                share2.wq_id = wq_id;
                share2.itm = 1;
                share2.worker = worker2;
                share2.share_percent = sharePre2;
                SqlCommand insert2Cmd = Dal.AddShareMaterialCmd(share2);
                Cmds.Add(insert2Cmd);
            }

            return Cmds;
        }

        //public List<SqlCommand> DelateShareMaterial(int wq_id)
        //{
        //    DataTable allWQs = LoadShareMaterial(wq_id);
        //    return DelateShareMaterial(wq_id, allWQs);
        //}


        private SqlCommand DelateShareMaterial(int wq_id)
        {
            //List<SqlCommand> Cmds = new List<SqlCommand>();
            // List<int> shareIds = TaskShareId(allWQs); , DataTable allWQs

            return new SqlCommand(string.Format(" Delete WPQty_H2_ShareMaterial where wq_id={0} ", wq_id));
            //for (int i = 0; i < shareIds.Count; i++)
            //{
                
            //}
            //return Cmds;
        }


        List<int> TaskShareId(DataTable allWQs)
        {
            List<int> ids = new List<int>();
            foreach (DataRow row in allWQs.Rows)
            {
                ids.Add(int.Parse(row["share_id"].ToString()));
            }

            return ids;
        }

         
        /// <summary>
        /// 取单据上的主手,副手
        /// </summary>
        /// <param name="wq_id"></param>
        /// <returns></returns>
        public List<string> GetWQWorker(int wq_id)
        {
            Bus_WPQtyBySize busWQ = new Bus_WPQtyBySize();
            var dtDataShares = busWQ.LoadBody_Share(wq_id);
            //保证数据的顺序是正确
            // 分成数据第1笔是主手的资料..插入数据是程序控制的.所以第一笔就定义为主手
            dtDataShares.DefaultView.Sort = "wq_id, wqb_id, itm";
            List<string> workers = dtDataShares.DefaultView.ToTable().AsEnumerable().Select(o => o["worker"].ToString()).Distinct().ToList();

            return workers;
        }

        /// <summary>
        /// 找出主手,副手的基本工资,分成比例
        /// </summary>
        /// <param name="wq_id"></param>
        /// <param name="dtDataShares"></param>
        /// <param name="workers"></param>
        /// <returns></returns>
        public List<decimal> GetWQNormalSharePercent(int wq_id, DataTable dtDataShares,  List<string> workers)
        {
            List<decimal> shares = new List<decimal>();
            //var dtDataShares = busWQ.LoadBody_Share(wq_id);
            dtDataShares.DefaultView.Sort = "wq_id, wqb_id, itm";
            DataTable dtDataSharesSorted = dtDataShares.DefaultView.ToTable();
            if (workers.Count <= 1)
            {
                shares.Add(100);
                shares.Add(0);
            }
            else
            {
                decimal per1 = decimal.Parse(dtDataSharesSorted.AsEnumerable().Where(o => o["worker"].ToString() == workers[0]).ToList()[0]["share_percent"].ToString());
                decimal per2 = decimal.Parse(dtDataSharesSorted.AsEnumerable().Where(o => o["worker"].ToString() == workers[1]).ToList()[0]["share_percent"].ToString());

                shares.Add(per1);
                shares.Add(per2);
            }
            return shares;
        }


        public SqlCommand DeleteMaterialCmd(int wq_id)
        {
            return
                new SqlCommand("Delete WPQty_H2_Material where wq_id = " + wq_id + "");
        }

        public SqlCommand InsertMaterialCmd(Model_WPQtyMaterial modelMaterial)
        {
            return Dal.AddMaterialCmd(modelMaterial);
        }

        #region 加载单据


        public DataTable LoadMaterial(int wq_id)
        {
            string sql = " select wqm_id, wq_id,material_id,use_unit,plan_qty,wl_qty,rl_qty,use_qty,qty,price from WPQty_H2_Material where 1=1 ";
            sql += "  and wq_id  =" + wq_id;
            sql += " order by wq_id, wqm_id ";
            return SqlHelper.ExecuteSql(sql);
        }


        public DataTable LoadShareMaterial(int wq_id)
        {
            string sql = " select share_id, wq_id, itm, worker, share_percent from WPQty_H2_ShareMaterial where 1=1 ";
            sql += "  and wq_id  =" + wq_id;
            sql += " order by itm ";
            return SqlHelper.ExecuteSql(sql);
        }

        

        #endregion


        //public List<decimal> GetWQMaterialSharePercent(int wq_id, DataTable dtDataMaterialShares, List<string> workers)
        //{
        //    List<decimal> shares = new List<decimal>();
        //    if (workers.Count <= 1)
        //    {
        //        shares.Add(100);
        //        shares.Add(0);
        //    }
        //    else
        //    {
        //        decimal per1 = decimal.Parse(dtDataMaterialShares.AsEnumerable().Where(o => o["worker"].ToString() == workers[0]).ToList()[0]["share_percent"].ToString());
        //        decimal per2 = decimal.Parse(dtDataMaterialShares.AsEnumerable().Where(o => o["worker"].ToString() == workers[1]).ToList()[0]["share_percent"].ToString());

        //        shares.Add(per1);
        //        shares.Add(per2);
        //    }
        //    return shares;
        //}

    }
}
