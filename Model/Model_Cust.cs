using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_Cust
    {
        public Model_Cust()
		{}
		 
		private string _cus_no;
		private string _name;
		private string _snm;
		private string _state= "0";
		private string _n_man;
		private DateTime? _n_dd;
		private string _e_man;
		private DateTime? _e_dd;
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
		public string name
		{
			set{ _name=value;}
			get{return _name;}
		}
		/// <summary>
		/// 
		/// </summary>
		public string snm
		{
			set{ _snm=value;}
			get{return _snm;}
		}
		/// <summary>
		/// 
		/// </summary>
		public string state
		{
			set{ _state=value;}
			get{return _state;}
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
		
    }
}
