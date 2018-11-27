using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Model
{
    public class Model_PrdtWpMaterial
    {
        public Model_PrdtWpMaterial()
        {
            BodySizes = new List<Model_PrdtWpMaterialSize>();
        }
        public int wm_id { get; set; }
        public string prd_no { get; set; }
        public string wp_no { get; set; }

        public int material_id { get; set; }

        public List<Model_PrdtWpMaterialSize> BodySizes { get; set; }
        //Ext.define("PrdtWpMaterial_Model", {
        //    extend: 'Ext.data.Model',
        //    fields: [
        //        { name: 'wm_id', type: 'int' },
        //        { name: 'prd_no', type: 'string' },
        //        { name: 'wp_no', type: 'string' },
        //        { name: 'material_id', type: 'int' }
        //    ]
        //});
    }
}
