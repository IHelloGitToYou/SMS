<%@ WebHandler Language="C#" Class="SearchBTN" %>

using System;
using System.Web;
using XBase.Business.Common;
using SMS.Bus.Common;

public class SearchBTN : IHttpHandler {

    public BusSearchBTN bus = new BusSearchBTN();
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        var Responser = context.Response;
        
        string mode = string.IsNullOrEmpty(context.Request["mode"]) ? "load" : context.Request["mode"];
        switch (mode.ToLower())
        { 
            case "update":
            case "load":
                string pageId = context.Request["pageId"];
                string sqlname = string.IsNullOrEmpty(context.Request["sqlname"]) ? "" : context.Request["sqlname"];
                string btnId = string.IsNullOrEmpty(context.Request["btnId"]) ? "" : context.Request["btnId"];
                if (mode == "update")
                    Responser.Write(update(pageId, sqlname, btnId));
                else if (mode == "load")

                    Responser.Write(bus.getList(pageId, btnId));
                
                break;
        }

        Responser.End();
    }

    public string update(string pageId, string sqlname, string btnId)
    {
        bus.update(pageId, sqlname, btnId);
        
            return "{success:true,result:true,errmsg:''}";
      
    }

    public bool IsReusable {
        get {
            return false;
        }   
    }

}