<%@ WebHandler Language="C#" Class="SunGridHead" %>

using System;
using System.Web;
using System.Data;

using SMS.Model;
using SMS.Bus;

public class SunGridHead : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        //.ToString("yyyy/MM/dd")+ " 00:00:00'
        SMS.Bus.SYS.Bus_SysVar busSysVar = new SMS.Bus.SYS.Bus_SysVar();
        if (context.Request["action"] == "GetServerSetting") {
            var row = busSysVar.GetData().Rows[0];
            context.Response.Write("{success:true,result:true, freeze_date:'"
                + GetDateString(DateTime.Parse( row["freeze_date"].ToString())) +"', ServerDate:'" + GetDateString(DateTime.Now.Date) +"',msg:''}");
            context.Response.End();
            //.ToString("yyyy/MM/dd") + " 00:00:00'
        }
        if (context.Request["action"] == "SetFreezeDate")
        {
            DateTime freezeDate = DateTime.Parse(context.Request["date"]);
            busSysVar.UpdateFreeze_date(freezeDate.Date);
            context.Response.Write("{success:true, result:true, msg:''}");
            context.Response.End();
        }

        context.Response.ContentType = "text/plain";
        SunGridHeadModel model = new SunGridHeadModel();
        Bus_GridHead bus = new Bus_GridHead();

        string mode = context.Request["mode"] == null ? context.Request["editState"] : context.Request["mode"];
        string nowUserId = context.Request["nowUserId"];
        model.gridId=context.Request["gridId"];
        model.pageId=context.Request["pageId"];
        model.userId = context.Request["userId"];
        model.cellSetting = context.Request["cellSetting"];
        model.strSort = context.Request["strSort"];


        bool result;

        switch (mode.ToLower())
        {
            case "loaddata":
                string conditions = context.Request["SearchConditions"];

                bool isReconfig = bool.Parse( context.Request["isReconfig"]);

                bool NeedSaveLastTime_GridId = bool.Parse(context.Request["NeedSaveLastTime_GridId"]);
                string jsonStr = "";

                if (NeedSaveLastTime_GridId == false || isReconfig == true)
                {
                    jsonStr = JsonClass.DataTable2Json(bus.GetList(conditions));
                }
                else
                {
                    jsonStr= JsonClass.DataTable2Json(bus.GetSort(model.pageId, model.gridId, model.userId));
                }
                context.Response.Write(jsonStr.Replace("/n",""));
                break;
            case "update":
                //先删除后加入
                result = bus.Update(model);
                context.Response.Write("{success:true,msg:'" + result.ToString().ToLower() + "'}");
                break;

        }
        context.Response.End();
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

    public string paddingInt(int day)
    {
        if (day >= 10)
            return day.ToString();
        else
            return "0" + day;
    }

    public string GetDateString(DateTime date) {
        return date.Year + "/" + paddingInt(date.Month) + "/" + paddingInt(date.Day);
    }

    public DataTable GetSystemSetting()
    {
        return SMS.DBHelper.SqlHelper.ExecuteSql(" select * from FreezeConfig");
    }

}