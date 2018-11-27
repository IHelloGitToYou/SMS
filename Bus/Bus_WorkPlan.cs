using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SMS.DAL;
using System.Data.SqlClient;
using SMS.DBHelper;
using System.Data;

namespace SMS.Bus
{
    public class Bus_WorkPlan
    {
        private Dal_WorkPaln Dal;

        public Bus_WorkPlan() {
            Dal = new Dal_WorkPaln();
        }

        public bool Save(Dictionary<string, string> Header, List<Dictionary<string, string>> Sizes, List<Dictionary<string, string>> DeptWps, ref int RefPlanId)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();
            int PlanId = int.Parse(Header["plan_id"]);
            bool isNew = PlanId < 0;
            if (isNew)
            {
                
                try
                {
                    object obj = SqlHelper.ExecuteScalar(Dal.InsertWorkPlanCmd(Header).CommandText, null);
                    RefPlanId = PlanId = int.Parse(obj.ToString());
                }
                catch
                {
                    throw new Exception("数据库插入异常!");
                }

                for (int i = 0; i < Sizes.Count; i++)
                {
                    Sizes[i]["plan_id"] = PlanId.ToString();
                    
                    Cmds.Add(Dal.InsertWorkPlan_SizesCmd(Sizes[i]));
                }
                for (int i = 0; i < DeptWps.Count; i++)
                {
                    DeptWps[i]["plan_id"] = PlanId.ToString();
                    Cmds.Add(Dal.InsertWorkPlan_DeptWPCmd(DeptWps[i]));
                }
            }
            else
            {
                Dictionary<string, string> SearchPlan = new Dictionary<string, string>();
                SearchPlan["plan_id"] = PlanId.ToString();
                DataTable OriginHeader = Dal.SearchWorkPlan(SearchPlan);
                DataTable OriginSizes = Dal.LoadPlan_Sizes(PlanId);

                //plan_no 在有计件不能更新,或删除
                if (OriginHeader.Rows[0]["plan_no"].ToString() != Header["plan_no"] ||
                    OriginHeader.Rows[0]["prd_no"].ToString() != Header["prd_no"]) {
                    if (UsedInWQ(PlanId))
                        throw new Exception("已有计件数据,不能更改计划单号与货号");
                }


                Cmds.Add(Dal.UpdateWorkPlanCmd(Header));

                List<int> orginSizeIDs = (from d in OriginSizes.AsEnumerable()
                                     select d.Field<int>("size_id")).ToList<int>();

                List<int> nowSizeIDs = (from d in Sizes.AsEnumerable()
                                          select int.Parse(d["size_id"])).ToList<int>();
                List<int> deleteSizeIDs = orginSizeIDs.Except(nowSizeIDs).ToList<int>();

                //List<int> deleteSizeIDs = (from d in Sizes.AsEnumerable()
                //                       where int.Parse(d["size_id"]) >= 0 && orginSizeIDs.IndexOf(int.Parse(d["size_id"])) < 0
                //                       select int.Parse(d["size_id"])).ToList<int>();

                for (int i = 0; i < deleteSizeIDs.Count; i++)
                {
                    int deleteSizeId = deleteSizeIDs[i];
                    if (UsedInWQ(PlanId, deleteSizeId) == true)
                    {
                        List<string> tempA = (from d in OriginSizes.AsEnumerable()
                                           where d.Field<int>("size_id") == deleteSizeId
                                           select d.Field<string>("size")).ToList<string>();

                        throw new Exception("尺寸[" + tempA[0][0] + "]已有计件数据不能删除!");
                    }
                }

                for (int i = 0; i < deleteSizeIDs.Count; i++)
                {
                    Cmds.Add(Dal.DeleteWorkPlan_SizesCmd(PlanId, deleteSizeIDs[i]));
                }

                for (int i = 0; i < Sizes.Count; i++)
                {
                    int sizeId = int.Parse(Sizes[i]["size_id"]);
                    if (sizeId < 0)
                    {
                        Cmds.Add(Dal.InsertWorkPlan_SizesCmd(Sizes[i]));
                    }
                    else if (orginSizeIDs.IndexOf(sizeId) >= 0)
                    {
                        DataRow originRecord = OriginSizes.Rows.Cast<DataRow>().Where(o => ((int)o["size_id"]) == sizeId).ElementAt(0);
                        if(originRecord["size"].ToString() != Sizes[i]["size"] 
                            ||
                            originRecord["color_id"].ToString() != Sizes[i]["color_id"]
                            )
                        {
                            if (UsedInWQ(PlanId, sizeId) == true)
                            {
                                throw new Exception("尺寸[" + originRecord["size"] + "](颜色:" + originRecord["color_id"] + ")已有计件数据不能删除!");
                            }
                        }
                        Cmds.Add(Dal.UpdateWork_SizesPlanCmd(PlanId, Sizes[i]));
                    }
                }
                //

                for (int i = 0; i < DeptWps.Count; i++)
                {
                    int deptId = int.Parse(DeptWps[i]["dept_id"]);
                    if (deptId < 0)
                        Cmds.Add(Dal.InsertWorkPlan_DeptWPCmd(DeptWps[i]));
                    else
                        Cmds.Add(Dal.UpdateWork_DeptWPCmd(PlanId, DeptWps[i]));
                }
            }

            return SqlHelper.ExecuteTransForList(Cmds.ToArray());
        }


        public bool ExsistPlanNo(string plan_no) {
            return SqlHelper.ExecuteSql("select 1 from WorkPlan where plan_no = '" + plan_no + "'").Rows.Count > 0;
        }

        public DataTable SearchWorkPlan(Dictionary<string, string> searchModel)
        {
            return Dal.SearchWorkPlan(searchModel);
        }

        public int GetColorId(int size_id)
        {
            string sql = " Select isnull(color_id,-1) as color_id  from WorkPlan_Sizes where size_id = " + size_id;
            var obj = SqlHelper.ExecuteScalar(sql);
            if (obj == null)
            {
                throw new Exception("没有计划单行(" + size_id + ")!");
            }
            return int.Parse(obj.ToString());
        }


        public DataTable LoadWorkPlanHeader(int plan_id)
        {
            Dictionary<string, string> searchModel = new Dictionary<string, string>();
            searchModel["plan_id"] = plan_id.ToString();
            return Dal.SearchWorkPlan(searchModel);
        }

        public DataTable LoadPlan_Sizes(int plan_id) {
            return Dal.LoadPlan_Sizes(plan_id);
        }

        public DataTable LoadPlan_SizesBySizeId(int size_id)
        {
            return Dal.LoadPlan_SizesBySizeId(size_id);
        }

        public string GetSizeBySizeId(int size_id)
        {
            var dt =  LoadPlan_SizesBySizeId(size_id);
            if (dt.Rows.Count <= 0)
            {
                return "";
            }
            return dt.Rows[0]["size"].ToString();
        }

        public DataTable LoadPlan_Sizes(int plan_id, int size_id)
        {
            return Dal.LoadPlan_Sizes(plan_id, size_id);
        }
        
        public DataTable LoadPlan_DeptWP(int plan_id)
        {
            return Dal.LoadPlan_DeptWP(plan_id);
        }
        //size 在双应的size计件不能,删除.  

        public void DeletePlan(int plan_id) {
            if (UsedInWQ(plan_id))
            {
                throw new Exception("计划单已经输入过计件!");
            }

            List<SqlCommand> cmds = new List<SqlCommand>();
            cmds.Add(new SqlCommand( "Delete WorkPlan where plan_id=" + plan_id));
            cmds.Add(new SqlCommand(" Delete WorkPlan_Sizes where plan_id=" + plan_id));
            cmds.Add(new SqlCommand(" Delete WorkPlan_DeptWP where plan_id=" + plan_id));

            SqlHelper.ExecuteTransWithCollections(cmds);
        }


        public bool UsedInWQ(int plan_id)
        {
            return SqlHelper.ExecuteSql(" select 1 from WPQty_H2  where plan_id=" + plan_id).Rows.Count > 0;
        }

        public bool UsedInWQ(int plan_id, int size_id)
        {
            bool flag = SqlHelper.ExecuteSql(" select 1 from WPQty_H2 where plan_id=" + plan_id + "  and size_id=" + size_id).Rows.Count > 0;
            if(flag == true)
            {
                return true;
            }

            flag = SqlHelper.ExecuteSql(" select 1 from WPQty_B2 where size_id=" + size_id).Rows.Count > 0;
            if (flag == true)
            {
                return true;
            }
            return false;
        }

        public SqlCommand UpdateWorkPlan_IsDoneCmd(int plan_id, bool isDone) {
            return Dal.UpdateWorkPlan_IsDoneCmd(plan_id, isDone);
        }

        public SqlCommand UpdateWorkPlanSizes_IsDoneCmd(int plan_id, int id, bool isDone) {
            return Dal.UpdateWorkPlanSizes_IsDoneCmd(plan_id, id, isDone);
        }
    }
}
