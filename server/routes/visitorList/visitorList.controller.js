

// Import Resources and Libs

const Email = require('../../notification/email');
const TextModel = require('../../notification/text');

const VisitorList = require('../../models/VisitorList');
const Employee = require('../../models/Employee');
const Appointment = require('../../models/Appointment');

/* handles route for getting the Company's visitor list */
exports.getCompanyVisitorListReq = function (req, res) {
  const company_id = req.params.id;
  exports.getCompanyVisitorList(company_id, (err_msg, result) => {
    if (err_msg) return res.status(400).json(err_msg);
    if (result == null) {
      result = new VisitorList();
      result.visitors = [];
      result.company_id = companyId;
      result.save(err => res.status(200).json(result));
    } else {
      return res.status(200).json(result);
    }
  });
};


/* logic for getting the Company's visitor list */
exports.getCompanyVisitorList = function (company_id, callback) {
  if (!company_id) { return callback({ error: 'Please send company id.' }, null); }
  VisitorList.findOne({ company_id }, (err, list) => {
    if (err) return callback({ error: 'Getting Visitor List' }, null);
    if (list == null) {
      list = new VisitorList();
      list.visitors = [];
      list.company_id = company_id;
    }
    list.save((err) => {
      if (err) return callback({ error: 'Error in saving' }, null);
      return callback(null, list);
    });
  });
};

/* handles route to delete visitor in the list*/
exports.deleteVisitorReq = function (req, res) {
  const visitor_id = req.params.visitor_id;
  const company_id = req.params.company_id;
  exports.deleteVisitor(company_id, visitor_id, (err_msg, result) => {
    if (err_msg) return res.status(400).json(err_msg);
    return res.status(200).json(result);
  });
};

/* logic for deleting the visitor in the list */
exports.deleteVisitor = function (company_id, visitor_id, callback) {
  if (!company_id) { return callback({ error: 'Please send company id.' }, null); }
  if (!visitor_id) { return callback({ error: 'Please send visitorList id.' }, null); }
  VisitorList.findOneAndUpdate(
        { company_id },
        { $pull: { visitors: { _id: visitor_id } } },
        { safe: true, upsert: true, new: true }, (err, data) => {
          if (err) return callback({ error: "Can't update list" }, null);
          return callback(null, data);
        });
};

/* clear the list */
exports.deleteReq = function (req, res) {
  const list_id = req.params.id;
  exports.delete(list_id, (err_msg, result) => {
    if (err_msg) return res.status(400).json(err_msg);
    return res.status(200).json(result);
  });
};

exports.delete = function (list_id, callback) {
  if (!list_id) { return callback({ error: 'Please send list id.' }, null); }
  VisitorList.findOne({ _id: list_id }, (err, list) => {
    if (err || list == null) return callback({ error: "Can't find company" }, null);
    list.visitors = [];
    list.save((err) => {
      if (err) return callback({ error: "Can't save" }, null);
      return callback(null, list);
    });
  });
};
// This route will be called when a visitor checks in
exports.createReq = function (req, res) {
  exports.create(req.body, (err_msg, result) => {
    if (err_msg) return res.status(400).json(err_msg);
    return res.status(200).json(result);
  });
};

exports.create = function (param, callback) {
    // required fields
  const company_id = param.company_id;
  const first_name = param.first_name;
  const last_name = param.last_name;
  const phone_number = param.phone_number;
  const checkin_time = param.checkin_time;

    // optional dic var
  const additional_info = param.additional_info;

    // find all the appointments for this visitor
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const query =
    {
      company_id,
      first_name,
      last_name,
      phone_number,
      date: { $gte: today, $lt: tomorrow },
    };

  Appointment.find(query, (err, appointments) => {
    const visitor =
      {
        company_id,
        last_name,
        first_name,
        phone_number,
        checkin_time,
        additional_info,
        appointments,
      };
    VisitorList.findOne(
            { company_id },
            (err, list) => {
              if (err) { return callback({ error: 'an error occured while finding' }, null); }
              if (list == null) {
                list = new VisitorList();
                list.visitors = [];
                list.company_id = company_id;
              }
              list.visitors.push(visitor);
              list.save((err) => {
                if (err) return callback({ error: 'an error in saving' }, null);
                return callback(null, list);
                    /* Employee.find({company : req.body.company_id},
                     function(err, employees) {
                     var i = 0;
                     var respond = function() {
                     i++;
                     if(i == employees.length) {
                     res.status(200).json(list);
                     }
                     };

                     Email.sendEmail(req.body.name, employees, function(){respond();});
                     TextModel.sendText(req.body.name, employees, function(){respond();});
                     }
                     );*/
              });
            },
        );
  });
};

