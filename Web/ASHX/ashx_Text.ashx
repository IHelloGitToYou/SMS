<%@ WebHandler Language="C#" Class="ashx_Text" %>

using System;
using System.Web;

public class ashx_Text : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        
        //1.接收值
        string name = context.Request["name"];
        string brithDay = context.Request["brithDay"];
        int age =  string.IsNullOrEmpty(context.Request["age"]) ? 0 : int.Parse(context.Request["age"]);
        string time = context.Request["time"];
        
        //2.数据的处理
        string jsonStr = "[{ 'no': '01', 'name': '志2' }, { 'no': '02', 'name': '成2' }, { 'no': '03', 'name': '涛2' }]";
        context.Response.Write(jsonStr);
        //3.返回结果
        //context.Response.Write("{success: true, abc_msg: '保存成功了'}");
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}