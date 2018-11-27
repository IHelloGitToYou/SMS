using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class SunGridHeadModel
    {
      public SunGridHeadModel() {}
      #region Model
      private string _gridid;
      private string _pageid;
      private string _cellsetting;
      private string _userid;

      public string strSort { set; get; }
      /// <summary>
      /// 
      /// </summary>
      public string gridId
      {
          set { _gridid = value; }
          get { return _gridid; }
      }
      /// <summary>
      /// 
      /// </summary>
      public string pageId
      {
          set { _pageid = value; }
          get { return _pageid; }
      }
      /// <summary>
      /// 
      /// </summary>
      public string cellSetting
      {
          set { _cellsetting = value; }
          get { return _cellsetting; }
      }
      /// <summary>
      /// 
      /// </summary>
      public string userId
      {
          set { _userid = value; }
          get { return _userid; }
      }
      #endregion Model
    }
}
