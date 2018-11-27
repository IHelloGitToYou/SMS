using SMS.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SMS.DAL.Material;
using System.Globalization;
using System.Data.SqlClient;
using System.Data;
using SMS.DBHelper;
using SMS.Bus.SYS;
using SMS.Bus.SYS.Material;

namespace SMS.Bus
{
   
    public class Bus_PrdtWpMaterial
    {
        /// <summary>
        ///
        /// </summary>
        public  class Work_CalModel
        {
            public string prd_no { get; set; }
            public string wp_no { get; set; }
            public string size { get; set; }
            public decimal qty { get; set; }

            public override string ToString()
            {
                return "{" + string.Format("prd_no:'{0}', wp_no:'{1}',size:'{2}',qty:{3}", prd_no, wp_no, size, qty) + "}";
            }
        }

        /// <summary>
        /// 用料需求信息
        /// </summary>
        public class MaterialCapOutput_CalModel
        {
            public int material_id { get; set; }
            public decimal need_qty { get; set; }

            public override string ToString()
            {
                return "{" + string.Format("material_id:'{0}', need_qty:{1}, plan_qty:{1}", material_id, need_qty, need_qty) + "}";
            }
        }


        private static Dal_PrdtWpMaterial dal = new Dal_PrdtWpMaterial();
        //Save
        public void Save(string prd_no, string wp_no, IEnumerable<Model_PrdtWpMaterial> Heads)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();
            Cmds.AddRange(DeleteCmds(prd_no, wp_no));
            SqlHelper.ExecuteTransForList(Cmds.ToArray());


            Cmds.Clear();
            List<int> wmIds = new List<int>();
            foreach (var item in Heads)
            {
                int newWMId = dal.AddHeadCmd(item);
                foreach (var bodyItem in item.BodySizes)
                {
                    bodyItem.wm_id = newWMId;
                    Cmds.Add( dal.AddBodySizeCmd(bodyItem));
                }
                SqlHelper.ExecuteTransForList(Cmds);
            }

            try
            {
                //更新皮奖数据
                List<int> wq_ids = GetEffectedPJWQ(prd_no, wp_no);
                UpdateWpMaterial(wq_ids, wp_no, Heads);
            }
            catch(Exception ex)
            {
                //throw new Exception("");
                throw ex;
            }
        }

        public List<SqlCommand> DeleteCmds(string prd_no, string wp_no)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();
            List<int> wmIds = GetWMId(prd_no, wp_no);
           
            if (wmIds.Count > 0)
            {
                cmds.Add(new SqlCommand(" Delete PrdtWpMaterialSize where wm_id in(" + string.Join(",", wmIds) + ")"));
                cmds.Add(new SqlCommand(" Delete PrdtWpMaterial     where prd_no = '" + prd_no + "' and wp_no = '" + wp_no + "'"));
            }
            return cmds;
        }
        
        public List<MaterialCapOutput_CalModel> GetNeedMaterial(IEnumerable<Work_CalModel> listWork)
        {
            List<MaterialCapOutput_CalModel> array = new List<MaterialCapOutput_CalModel>();

            foreach (var workItem in listWork)
            {
                DataTable dtHead = LoadHead(workItem.prd_no, workItem.wp_no);
                for (int i = 0; i < dtHead.Rows.Count; i++)
                {
                    int wm_id = int.Parse(dtHead.Rows[i]["wm_id"].ToString());
                    int material_id = int.Parse(dtHead.Rows[i]["material_id"].ToString());
                    decimal need_qty = LoadPrdtWpOfSizeMaterialUseUnit(wm_id, workItem.size) * workItem.qty;
                    if (array.Where(o => o.material_id == material_id).Count() > 0)
                    {
                        array.Where(o => o.material_id == material_id).ToArray()[0].need_qty += need_qty;
                    }
                    else
                    {
                        MaterialCapOutput_CalModel cal = new MaterialCapOutput_CalModel();
                        cal.material_id = material_id;
                        cal.need_qty = need_qty;
                        array.Add(cal);
                    }
                }
            }

            return array;
        }

        #region 更改工序皮奖物料后,更新皮奖计件单的皮奖明细
        public List<int> GetEffectedPJWQ(string prd_no, string wp_no)
        {
            SMS.DAL.Dal_WPQtyBySize dalWPSize = new SMS.DAL.Dal_WPQtyBySize();
            var searchPJ = new Dictionary<string, string>();
            Bus_SysVar busSysVar = new Bus_SysVar();
            //不更新,结账日期前的单 
            DateTime freezeDate = busSysVar.GetFreezeDate();
            searchPJ["S_jx_dd"] = freezeDate.ToShortDateString(); 
            searchPJ["prd_no"] = prd_no;
            searchPJ["wp_no"] = wp_no;
            var dt = dalWPSize.SearchHeaderOnPJ(searchPJ);
            List<int> wq_ids = dt.AsEnumerable().Select(o=>int.Parse(o["wq_id"].ToString())).ToList();
            return wq_ids;
        }


        public void UpdateWpMaterial(List<int> wq_ids, string wp_no, IEnumerable<Model_PrdtWpMaterial> Heads)
        {
            Bus_WPQtyBySize busWPSize = new Bus_WPQtyBySize();
            SYS.Material.Bus_WpQtyMaterial bus2 = new SYS.Material.Bus_WpQtyMaterial();
            List<SqlCommand> Cmds = new List<SqlCommand>();
            foreach (var wq_id in wq_ids)
            {
                var dtBody = busWPSize.LoadBody(wq_id);
                foreach (var item in dtBody.AsEnumerable().Where(o => o["wp_no"].ToString() == wp_no)) {
                    decimal new_std_unit_pre = Heads.First().BodySizes.Where(p => p.size == item["size"].ToString()).First().use_unit;
                    decimal amt = 
                                    (new_std_unit_pre + Common.BusComm.GetDouble(item["ajust_std_unit"].ToString())- Common.BusComm.GetDouble(item["unit_pre"].ToString()))
                                    *
                                    Common.BusComm.GetDouble(item["price"].ToString()) 
                                    * 
                                    Common.BusComm.GetDouble(item["wp_qty_pair"].ToString());

                    Cmds.Add( new SqlCommand( string.Format( @" 
                                        Update PJ_Body set std_unit_pre = '{0}', amt = '{1}' where id = '{2}'" ,
                                        
                                        new_std_unit_pre, amt, item["id"].ToString())));

                }
                //标准单耗变化
                //重推金额var amt = (e.record.get('std_unit_pre') + e.record.get('ajust_std_unit') 
                //- e.record.get('unit_pre')) * e.record.get('price') * e.record.get('wp_qty_pair');

            }

            SqlHelper.ExecuteTransForList(Cmds);
        }


    //////    List<Work_CalModel> workJobs = TranBodyToWork_Cal(dtBody);
    //////    List<MaterialCapOutput_CalModel> nMaterials = GetNeedMaterial(workJobs);

    //////    DataTable dtBodyMaterail = bus2.LoadMaterial(wq_id);
    //////    var newBodyModels = _CombineNeedAndTableMaterailQty(wq_id, dtBodyMaterail, nMaterials);

    //////    Cmds.Add(bus2.DeleteMaterialCmd(wq_id));
    //////    foreach (var material in newBodyModels)
    //////    {
    //////        Cmds.Add(bus2.InsertMaterialCmd(material));
    //////    }
    //////private List<Work_CalModel> TranBodyToWork_Cal(DataTable dtBody)
    //////{
    //////    List<Work_CalModel> result = new List<Work_CalModel>();
    //////    Bus_WorkPlan busPlan = new Bus_WorkPlan();
    //////    foreach (DataRow row in dtBody.Rows)
    //////    {
    //////        Work_CalModel cal = new Work_CalModel();
    //////        cal.prd_no = row["prd_no"].ToString();
    //////        cal.wp_no = row["wp_no"].ToString();
    //////        int size_id = int.Parse(row["size_id"].ToString());
    //////        cal.size = busPlan.GetSizeBySizeId(size_id);
    //////        if (cal.size == "")
    //////        {
    //////            throw new Exception("SizeId:" + size_id + "不存在");
    //////        }
    //////        cal.qty = SMS.Bus.Common.BusComm.GetDouble(row["qty_pair"].ToString());
    //////        result.Add(cal);
    //////    }

    //////    return result;
    //////}

    //////private List<Model_WPQtyMaterial> _CombineNeedAndTableMaterailQty(int wq_id, DataTable dtBodyMaterail, List<MaterialCapOutput_CalModel> needMaterials)
    //////{
    //////    List<Model_WPQtyMaterial> result = new List<Model_WPQtyMaterial>();
    //////    foreach (var need in needMaterials)
    //////    {
    //////        Model_WPQtyMaterial newItem = new Model_WPQtyMaterial();
    //////        newItem.wq_id = wq_id;
    //////        newItem.material_id = need.material_id;
    //////        newItem.plan_qty = need.need_qty;

    //////        var exsited = dtBodyMaterail.AsEnumerable().Where(o => int.Parse(o["material_id"].ToString()) == need.material_id).ToList();
    //////        if (exsited.Count > 0)
    //////        {
    //////            newItem.wl_qty = exsited.Select(o => Common.BusComm.GetDouble((o["wl_qty"].ToString()))).First();
    //////            newItem.rl_qty = exsited.Select(o => Common.BusComm.GetDouble((o["rl_qty"].ToString()))).First();
    //////        }

    //////        newItem.use_qty = newItem.wl_qty - newItem.rl_qty;
    //////        if (newItem.plan_qty <= 0 || newItem.use_qty <= 0)
    //////        {
    //////            newItem.qty = 0;
    //////        }
    //////        else
    //////        {
    //////            newItem.qty = newItem.plan_qty - newItem.use_qty;
    //////        }
    //////        newItem.price = Bus_Material.GetPrice(newItem.material_id);
    //////        result.Add(newItem);
    //////    }
    //////    return result;
    //////}

    #endregion


    #region 加载数据
    //LoadHead
    public DataTable LoadHead(string prd_no)
        {
            return SqlHelper.ExecuteSql(@" Select a.*, b.price 
                                            from PrdtWpMaterial a 
                                            left join material b on b.material_id = a.material_id 
                                            where a.prd_no = '" + prd_no + "'");
        }

        public DataTable LoadHead(string prd_no, string wp_no)
        {
            return SqlHelper.ExecuteSql(@" Select a.*, b.price 
                                            from PrdtWpMaterial a 
                                            left join material b on b.material_id = a.material_id 
                                            where a.prd_no = '" + prd_no + "' and a.wp_no = '" + wp_no + "'");
        }
        public DataTable LoadHeadWithWpName(string prd_no)
        {
            return SqlHelper.ExecuteSql(" Select V.*, WP.name as wp_name from PrdtWpMaterial V left join Prdt_Wp WP on WP.prd_no = V.prd_no and WP.wp_no = V.wp_no where WP.prd_no = '" + prd_no + "' ");
        }

        private List<int> GetWMId(string prd_no, string wp_no)
        {
            DataTable dtHead = LoadHead(prd_no, wp_no);
            List<int> wmIds = new List<int>();
            foreach (DataRow row in dtHead.Rows)
            {
                wmIds.Add(int.Parse(row["wm_id"].ToString()));
            }

            return wmIds;
        }

        public DataTable LoadBodySize(string prd_no, string wp_no)
        {
            List<int> wmIds = GetWMId(prd_no, wp_no);
            if (wmIds.Count == 0)
            {
                //throw new Exception("尺寸单耗数据不存在!");
                return new DataTable();
            }

            return SqlHelper.ExecuteSql(" Select * from PrdtWpMaterialSize where wm_id in(" + string.Join(",", wmIds) + ") order by wm_id, size");
        }

        public DataTable LoadBodySize(string prd_no, string size, int aaaaaa)
        {
            DataTable dtAllHead = LoadHead(prd_no);
            List<int> wmIds = new List<int>();
            foreach (DataRow row in dtAllHead.Rows)
            {
                wmIds.Add(int.Parse(row["wm_id"].ToString()));
            }
            if (wmIds.Count == 0)
            {
                //throw new Exception("尺寸单耗数据不存在!");
                return new DataTable();
            }
            return SqlHelper.ExecuteSql(" Select * from PrdtWpMaterialSize where wm_id in(" + string.Join(",", wmIds) + ") and size ='" + size + "' order by wm_id, size");
        }


        public DataTable LoadBodySize(string prd_no, string wp_no, string size)
        {
            List<int> wmIds = GetWMId(prd_no, wp_no);
            if (wmIds.Count == 0)
            {
                //throw new Exception("尺寸单耗数据不存在!");
                return new DataTable();
            }

            return SqlHelper.ExecuteSql(" Select * from PrdtWpMaterialSize where wm_id in(" + string.Join(",", wmIds) + ") and size ='"+ size + "' order by wm_id, size");
        }

        public decimal LoadPrdtWpOfSizeMaterialUseUnit(int wm_id, string size)
        {
              var dt = SqlHelper.ExecuteSql(" Select * from PrdtWpMaterialSize where wm_id = "+ wm_id + " and size ='" + size + "' order by wm_id, size");
            if (dt.Rows.Count <= 0)
            {
                return 0;
            }

            return decimal.Parse(dt.Rows[0]["use_unit"].ToString());
        }

        #endregion
    }
}
