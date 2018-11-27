<%@ WebHandler Language="C#" Class="GetLastTableNO" %>

using System;
using System.Web;
using XBase.Business.Common;

public class GetLastTableNO : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";

        GetMaxIDBus bus = new GetMaxIDBus();
        string pageId = context.Request["pageId"];
        
        context.Response.Write("{success:true,result:true,newno:'" + bus.GetLastID(pageId) + "',errmsg:''}");
        context.Response.End();
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}