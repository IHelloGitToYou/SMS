using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class TEST : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        btnA.Value = "后台名";
        
    }

    protected override void OnInit(EventArgs e)
    {
        base.OnInit(e);


    }

    protected override void OnPreRender(EventArgs e)
    {
        base.OnPreRender(e);

        string loadingDivControl = @"<script language=javascript>
            setTimeout(function() { document.getElementById('btnA').value = 'QQ123';}, 1200);
        </script> ";// alert('123'); 

        // this.Response.Write(loadingDivControl);
        this.ClientScript.RegisterClientScriptBlock(this.GetType(), new Guid().ToString(), loadingDivControl);
    }

    protected override void OnUnload(EventArgs e)
    {
        base.OnUnload(e);


        
    }
}