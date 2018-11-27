<%@ WebHandler Language="C#" Class="Prdt_WP" %>

using System;
using System.Text;

using System.Web;
using System.Data;
using System.Collections.Generic;

using SMS.Model;
using SMS.Bus;
using SMS.DAL;

public class Prdt_WP : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        var Responser = context.Response;
        var Request = context.Request;


        string action = Request["action"];
        if (string.IsNullOrEmpty(action))
        {
            Responser.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            Responser.End();
        }
        //　大写
        action = action.ToUpper();
        string prd_no = Request["prd_no"];
        Bus_Prdt_WP bus = new Bus_Prdt_WP();
        List<Model_Prdt_WP> M1 = new List<Model_Prdt_WP>();

        if (action == "FormSave".ToUpper())
        {
            bool isNew = bus.LoadPrdtWp(prd_no).Rows.Count <= 0;
            if (isNew)
            {
                int BodyCnt = int.Parse(Request["Cnt"]);
                //生成唯一工序代号　码 wp_no
                //Random rdTool = new Random();
                //int rdNum =  rdTool.Next(100);
                int rdNum = 1;
                int i = 0;

                for (; i < BodyCnt; ++i)
                {
                    Model_Prdt_WP model = new Model_Prdt_WP();
                    model.prd_no = prd_no;
                    model.itm = i;
                    model.wp_no = rdNum.ToString();

                    model.dep_no = Request["dep_no_" + i];
                    model.name = Request["name_" + i];
                    model.pic_num = int.Parse(Request["pic_num_" + i]);
                    model.is_cutwp = Request["is_cutwp_" + i].ToLower();
                    model.is_pswp = Request["is_pswp_" + i].ToLower();
                    model.is_size_control = Request["is_size_control_" + i].ToLower();
                    model.wq_type = Request["wq_type_" + i].ToLower();
                    model.color_different_price = (Request["color_different_price_" + i].ToLower() == "true" ? true : false);
                    model.save_material_award = (Request["save_material_award_" + i].ToLower() == "true" ? true : false);
                    model.state = Request["state_" + i];
                    M1.Add(model);
                    ++rdNum;
                }

                bool isOk = bus.Add(M1);
                Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:''}");
                Responser.End();
            }
            else
            {
                int MaxWpNoNum = bus.MaxWpNo(Request["prd_no"]);
                int BodyCnt = int.Parse(Request["Cnt"]);
                int UPCnt = int.Parse(Request["UPCnt"]);
                List<string> DeleteWPs = new List<string>();
                List<string> Ups = new List<string>();
                int i = 0;
                for (; i < UPCnt; ++i)
                {
                    Ups.Add(Request["up_no_" + i]);
                }
                ////1.更新工序列表
                i = 0;

                for (; i < BodyCnt; ++i)
                {
                    Model_Prdt_WP model = new Model_Prdt_WP();
                    model.prd_no = prd_no;
                    model.itm = i;

                    if (Request["wp_state_" + i].ToUpper() == "NEWWP")
                        model.wp_no = (++MaxWpNoNum).ToString();
                    else if (Request["wp_state_" + i].ToUpper() == "DROPWP")
                    {
                        if (bus.UsedWpNo(prd_no, Request["wp_no_" + i]) == true)
                        {
                            Responser.Write("{success:true,result:false,msg:'不能删除工序，工序在计件中已使用!'}");
                            Responser.End();
                        }
                        DeleteWPs.Add(Request["wp_no_" + i]);
                        continue;
                    }
                    else
                        model.wp_no = Request["wp_no_" + i];

                    model.dep_no = Request["dep_no_" + i];
                    model.name = Request["name_" + i];
                    model.pic_num = int.Parse(Request["pic_num_" + i]);
                    model.is_cutwp = Request["is_cutwp_" + i].ToLower();
                    model.is_pswp = Request["is_pswp_" + i].ToLower();
                    model.is_size_control = Request["is_size_control_" + i].ToLower();
                    model.wq_type = Request["wq_type_" + i].ToLower();
                    model.color_different_price = (Request["color_different_price_" + i].ToLower() == "true" ? true : false);
                    model.save_material_award = (Request["save_material_award_" + i].ToLower() == "true" ? true : false);

                    model.state = Request["state_" + i];

                    M1.Add(model);
                }
                bool isOk = bus.Update(prd_no, M1);
                if (isOk == false)
                {
                    Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:''}");
                    Responser.End();
                }
                //清空删除了的工序 ,的尺寸限制
                DeleteRemovedSize(prd_no, DeleteWPs);

                Bus_Prdt_WPUP BusUp = new Bus_Prdt_WPUP();
                //2.更新各个工序单价
                i = 0;
                for (; i < UPCnt; ++i)
                {
                    int j = 0;
                    List<Model_Prdt_WP_TFUP> M2 = new List<Model_Prdt_WP_TFUP>();
                    int M1Index = 0;
                    for (; j < BodyCnt; ++j)
                    {
                        Model_Prdt_WP_TFUP m2 = new Model_Prdt_WP_TFUP();
                        if (Request["wp_state_" + j] == "DROPWP")
                        {
                            continue;
                        }

                        m2.up_no = int.Parse(Ups[i]);
                        m2.prd_no = prd_no;
                        m2.wp_no = M1[M1Index].wp_no;
                        m2.up_pic = decimal.Parse(Request["up_pic" + m2.up_no + "_" + j]);
                        m2.up_pair = decimal.Parse(Request["up_pair" + m2.up_no + "_" + j]);

                        ++M1Index;
                        M2.Add(m2);
                    }

                    isOk = BusUp.SaveTF(int.Parse(Ups[i]), M2);

                    if (isOk == false)
                    {
                        Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:''}");
                        Responser.End();
                    }
                }

                ///更新计件单上的 单价
                Bus_WPQtyBySize busWPQty = new Bus_WPQtyBySize();
                List<string> allWps = new List<string>();
                List<string> errWps = new List<string>();
                busWPQty.UpdateWpPrice(prd_no, ref allWps, ref errWps);

                Responser.Write("{success:true,result:" + isOk.ToString().ToLower()
                    + ",isNew:" + isNew.ToString().ToLower()
                    + ",msg:'', allWps:[" + SMS.Bus.Common.BusComm.ListToSqlWhereIn(allWps.ToArray()) + "]"
                    + ",errWps:[" + SMS.Bus.Common.BusComm.ListToSqlWhereIn(errWps.ToArray()) + "]"
                    + "}");
                Responser.End();
            }
        }


        //model.cus_no = Request["cus_no"];
        //model.name = Request["name"];
        //model.snm = Request["snm"];
        //model.state = Request["state"];

        //model.n_man = model.e_man = Request["n_man"];
        //model.n_dd = DateTime.Now;
        //model.e_dd = DateTime.Now;

        //bool isOk = true;

        //if (action == "NEW")
        //{
        //    isOk = bus.Add(model);
        //    Responser.Write("{success:true,result:" + isOk.ToString().ToLower()  + ",msg:''}");
        //}
        //else
        //{
        //    isOk = bus.Update(model);
        //    Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:''}");
        //}
        //Responser.End();
        //}
        if (action == "SetSwitch".ToUpper())
        {
            bool isOk = true;
            string action_type = Request["action_type"];
            bool switchResult = Request["switch"].ToUpper() == "T";
            string wp_no = Request["wp_no"];
            string msgStr = "设置颜色区分属性失败,可能数据表末配置好.请联系吖潮";
            try
            {
                if (action_type == "color_different_price")
                {
                    bus.SwitchColorDifferentPrice(prd_no, wp_no, switchResult);
                }

                if (action_type == "save_material_award")
                {
                    bus.SwitchSaveMaterialAward(prd_no, wp_no, switchResult);
                }

                if (action_type == "is_size_control")
                {
                    bus.SwitchSizeControl(prd_no, wp_no, switchResult);
                }
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            context.Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "'}");
            context.Response.End();
        }

        if (action == "GETDATA")
        {
            string sqlWhere = Request["sqlWhere"];
            int total = bus.GetRecordCount(sqlWhere);
            DataTable dt = bus.GetListByPage(sqlWhere, "", -1, -1);

            Responser.Write(JsonClass.DataTable2JsonWithPaging(dt, total));
            Responser.End();
        }


        if (action == "GetPrdtUps".ToUpper())
        {
            Bus_Prdt_WPUP busHF = new Bus_Prdt_WPUP();
            DataTable dtHF = busHF.GetData("prd_no = '" + prd_no + "'");
            int total = busHF.GetRecordCount("prd_no = '" + prd_no + "'");

            string json = JsonClass.DataTable2JsonWithPaging(dtHF, total);

            Bus_Prdt_WPUP WPBus = new Bus_Prdt_WPUP();
            List<string> up_nosDefault = WPBus.GetValidUps(prd_no);

            json = json.Insert(json.LastIndexOf("}"), ",DefalutUPs:'" + string.Join(",", up_nosDefault) + "'");
            Responser.Write(json);
            Responser.End();
        }

        if (action == "GetPrdtWps".ToUpper())
        {
            if (string.IsNullOrEmpty(prd_no))
            {
                Responser.Write("[]");
                Responser.End();
            }

            List<string> showUps = Common.StringToList(Request["ups"], ",");
            DataTable dt = bus.GetPrdtWpNos(prd_no, true, showUps);
            string SJson = JsonClass.DataTable2Json(dt);

            Responser.Write("{total: 100000, items:" + SJson + "}");
            Responser.End();
        }


        if (action == "DELETE_AllWps".ToUpper())
        {
            if (bus.UsedWpNo(prd_no) == true)
            {
                Responser.Write("{success:true,result:false,msg:'不能清空工序, 因为已有计件数据!'}");
                Responser.End();
            }

            bool isOk = bus.Delete(prd_no);
            if (isOk)
            {
                Bus_SizeControl busSize = new Bus_SizeControl();
                busSize.ClearPrdtSize(prd_no);
            }
            Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:''}");
            Responser.End();
        }

        if (action == "DELETE_AWp".ToUpper())
        {
            bool isOk = bus.Delete(prd_no, Request["wp_no"]);
            Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + "}");
            Responser.End();
        }

        Responser.End();
    }

    public void DeleteRemovedSize(string prd_no, List<string> DeleteWPs)
    {
        Bus_SizeControl busSize = new Bus_SizeControl();

        for (int g = 0; g < DeleteWPs.Count; g++)
        {
            busSize.ClearPrdtSize(prd_no, DeleteWPs[g]);
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}