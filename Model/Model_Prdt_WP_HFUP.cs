using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_Prdt_WP_HFUP
    {
        public Model_Prdt_WP_HFUP()
		{}
		#region Model
		private int _up_no;
		private DateTime? _start_dd;
		private DateTime? _end_dd;
		private string _cus_no;
        public string dep_no{get;set;}
		private string _prd_no;
		private string _n_man;
		private DateTime? _n_dd;
		private string _e_man;
		private DateTime? _e_dd;
        public string ActionType { get; set; }  //"-1" 代表新记录，"-3"代表要删除 其他是修改行
		/// <summary>
		/// 
		/// </summary>
        public int up_no
		{
			set{ _up_no=value;}
			get{return _up_no;}
		}
		/// <summary>
		/// 
		/// </summary>
		public DateTime? start_dd
		{
			set{ _start_dd=value;}
			get{return _start_dd;}
		}
		/// <summary>
		/// 
		/// </summary>
		public DateTime? end_dd
		{
			set{ _end_dd=value;}
			get{return _end_dd;}
		}
		/// <summary>
		/// 
		/// </summary>
		public string cus_no
		{
			set{ _cus_no=value;}
			get{return _cus_no;}
		}
		/// <summary>
		/// 
		/// </summary>
		public string prd_no
		{
			set{ _prd_no=value;}
			get{return _prd_no;}
		}
		/// <summary>
		/// 
		/// </summary>
		public string n_man
		{
			set{ _n_man=value;}
			get{return _n_man;}
		}
		/// <summary>
		/// 
		/// </summary>
		public DateTime? n_dd
		{
			set{ _n_dd=value;}
			get{return _n_dd;}
		}
		/// <summary>
		/// 
		/// </summary>
		public string e_man
		{
			set{ _e_man=value;}
			get{return _e_man;}
		}
		/// <summary>
		/// 
		/// </summary>
		public DateTime? e_dd
		{
			set{ _e_dd=value;}
			get{return _e_dd;}
		}
		#endregion Model

		
    }
}
