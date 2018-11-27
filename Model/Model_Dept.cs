using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_Dept
    {
        public Model_Dept()
		{}
	 
		private string _dep_no;
		private string _name;
        private string _up_dep_no;
		private string _istop= "1";
		private string _n_man;
		private DateTime? _n_dd;
		private string _e_man;
		private DateTime? _e_dd;
		/// <summary>
		/// 
		/// </summary>
		public string dep_no
		{
			set{ _dep_no=value;}
			get{return _dep_no;}
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
        public string up_dep_no
		{
            set { _up_dep_no = value; }
            get { return _up_dep_no; }
		}
		/// <summary>
		/// 
		/// </summary>
		public string istop
		{
			set{ _istop=value;}
			get{return _istop;}
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
