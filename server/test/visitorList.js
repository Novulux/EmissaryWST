const request = require('supertest');

const config = require('../config/config');
const Company = require('../models/Company');
const Appointment = require('../models/Appointment');
const VisitorList = require('../models/VisitorList');

describe('VisitorList', () => {
  const url = `localhost:${config.port}`;

  let currCompany;
  let currVisitorList;
  let appointment1;
  let appointment2;
  let visitor1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  var tomorrow = new Date();
  var tomorrow = tomorrow.setDate(today.getDate() + 2);

    // info for the company
  const company_info = {
    email: 'test@test.edu',
    credit_card_number: '1231231241251',
    name: 'test',
    expiration_date: '6/17',
    phone_number: '1234567890',
    paid_time: new Date(),
  };

    // info for first visitor
  const first_visitor_info = {
    first_name: 'test1',
    last_name: 'test1',
    phone_number: '1234567890',
    checkin_time: new Date(),
    additional_info: {
      allergies: 'peanuts',
    },
  };

    // info for second visitor
  const second_visitor_info = {
    first_name: 'test2',
    last_name: 'test2',
    phone_number: '1234567890',
    checkin_time: new Date(),
    additional_info: {
      allergies: 'seafood',
    },
  };

    // info for visitor_one's appointment
  const first_appointment_info = {
    first_name: first_visitor_info.first_name,
    last_name: first_visitor_info.last_name,
    phone_number: first_visitor_info.phone_number,
    date: new Date(),
    provider_name: 'provider1',
  };

    // info for visitor_two's appointment
  const second_appointment_info = {
    first_name: second_visitor_info.first_name,
    last_name: second_visitor_info.last_name,
    phone_number: second_visitor_info.phone_number,
    date: tomorrow,
    provider_name: 'provider2',
  };


  before((done) => {
    currCompany = new Company();
    currCompany.email = company_info.email;
    currCompany.credit_card_number = company_info.credit_card_number;
    currCompany.name = company_info.name;
    currCompany.expiration_date = company_info.expiration_date;
    currCompany.phone_number = company_info.phone_number;
    currCompany.paid_time = company_info.paid_time;
    currCompany.save((err, c) => {
      if (err) throw (err);
      currCompany = c;
      appointment1 = new Appointment();
      appointment1.first_name = first_appointment_info.first_name;
      appointment1.last_name = first_appointment_info.last_name;
      appointment1.phone_number = first_appointment_info.phone_number;
      appointment1.date = first_appointment_info.date;
      appointment1.company_id = c._id;
      appointment1.provider_name = first_appointment_info.provider_name;
      appointment1.save((err, a1) => {
        console.log(err);
        if (err) throw (err);
        appointment1 = a1;
        appointment2 = new Appointment();
        appointment2.first_name = second_appointment_info.first_name;
        appointment2.last_name = second_appointment_info.last_name;
        appointment2.phone_number = second_appointment_info.phone_number;
        appointment2.date = second_appointment_info.date;
        appointment2.company_id = c._id;
        appointment2.provider_name = second_appointment_info.provider_name;
        appointment2.save((err, a2) => {
          if (err) throw (err);
          appointment2 = a2;
          done();
        });
      });
    });
  });


  it('should add vistitors to list', (done) => {
    request(url)
        .post('/api/visitorLists')
        .send({
          company_id: currCompany._id,
          first_name: first_visitor_info.first_name,
          last_name: first_visitor_info.last_name,
          phone_number: first_visitor_info.phone_number,
          checkin_time: first_visitor_info.checkin_time,
          additional_info: first_visitor_info.additional_info,
        })
        .expect(200)
        .end((err, res) => {
          if (err) throw (err);
          res.body.should.have.property('_id');
          res.body.should.have.property('visitors');
          const visitors = res.body.visitors;
          visitors.should.have.length.of(1);
          visitor1 = visitors[0];

          visitor1.should.have.property('_id');
          visitor1.should.have.property('company_id');
          visitor1.should.have.property('first_name');
          visitor1.should.have.property('last_name');
          visitor1.should.have.property('phone_number');
          visitor1.should.have.property('checkin_time');

          visitor1.should.have.property('appointments');
          visitor1.appointments.should.be.an.instanceof(Array);
          visitor1.appointments.should.have.length.of(1);

          visitor1.should.have.property('additional_info');
          visitor1.additional_info.should.have.property('allergies');


          currVisitorList = res.body;
            // adding second visitor
          request(url)
                .post('/api/visitorLists')
                .send({
                  company_id: currCompany._id,
                  first_name: second_visitor_info.first_name,
                  last_name: second_visitor_info.last_name,
                  phone_number: second_visitor_info.phone_number,
                  checkin_time: second_visitor_info.checkin_time,
                  additional_info: second_visitor_info.additional_info,
                })
                .expect(200)
                .end((err, res) => {
                  if (err) throw (err);
                  const visitors = res.body.visitors;
                  visitors.should.have.length.of(2);
                  const visitor2 = visitors[0];
                  visitor2.should.have.property('appointments');
                  visitor2.appointments.should.be.an.instanceof(Array);
                  visitor2.appointments.should.have.length.of(1);
                  done();
                });
        });
  });


  it('should get visitor list', function (done) {
    this.timeout(8000);
    request(url)
            .get(`/api/visitorLists/company/${currCompany._id}`)
            .send()
            .expect(200)
            .end((err, res) => {
              should.exist(res.body.visitors);
              res.body.visitors.should.be.an.instanceof(Array);
              res.body.visitors.should.have.length.of(2);
              done();
            });
  });

  it('should not get visitor list', function (done) {
    this.timeout(8000);
    request(url)
            .get('/api/visitorLists/company/0')
            .send()
            .expect(404)
            .end((err, res) => {
              console.log(res.body);
              res.body.should.have.property('error');
              done();
            });
  });

  it('should delete specified Visitor', (done) => {
    request(url)
            .get(`/api/visitorLists/company/${currCompany._id}`)
            .end((err, res) => {
              let prevLen = 0;
              let patientId;
              res.body.should.have.property('visitors');
              res.body.visitors.should.be.an.instanceof(Array);
              for (let i = 0; i < res.body.visitors.length; i++) {
                prevLen++;
                patientId = res.body.visitors[i]._id;
              }
              request(url)
                    .delete(`/api/visitorLists/company/${currCompany._id
                        }/visitor/${visitor1._id}`)
                    .expect(200)
                    .end((err, res) => {
                      should.exist(res.body);
                      res.body.visitors.should.be.an.instanceof(Array);
                      res.body.visitors.should.have.length.of(prevLen - 1);
                      done();
                    });
            });
  });

  it('should clear visitorLists', function (done) {
    this.timeout(8000);
    request(url)
            .delete(`/api/visitorLists/${currVisitorList._id}`)
            .expect(200)
            .end((err, res) => {
              res.body.should.have.property('visitors');
              res.body.visitors.should.have.length.of(0);
              done();
            });
  });


  after((done) => {
    Appointment.remove({ _id: appointment1._id }, (err, _) => {
      if (err) throw (err);
      Appointment.remove({ _id: appointment2._id }, (err, _) => {
        if (err) throw (err);
        Company.remove({ _id: currCompany._id }, (err, _) => {
          if (err) throw (err);
                    // done();
          VisitorList.remove({ _id: currVisitorList._id }, (err, _) => {
            if (err) throw (err);
            done();
          });
        });
      });
    });
  });
},
);
