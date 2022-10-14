const Invoice = require('../models/invoice.model');
const { send_sms } = require('../services/message.services');

const createInvoice = async (req, res) => {
  const {
    meter_number,
    month,
    year,
    required_amount,
    unit_consumed,
    reading_day,
    debt,
    phone_number,
  } = req.body;

  if (
    !month ||
    !year ||
    !required_amount ||
    !meter_number ||
    !unit_consumed ||
    !reading_day ||
    !debt ||
    !phone_number
  ) {
    return res.status(400).json({
      success: 0,
      data: 'Fill the required fields',
    });
  }

  // pull debt
  const data = await Invoice.find({ meter_number: meter_number });

  return res.status(200).json({
    success: 1,
    message: 'invoice created',
    data: data,
  });

  // return res.send(data);

  // const { remain_amount: debt } = await Invoice.findOne({
  //   meter_number: meter_number,
  // });

  const invoice = new Invoice({
    meter_number,
    month,
    year,
    required_amount,
    unit_consumed,
    reading_day,
    debt,
    phone_number,
  });

  const totalBill = required_amount + debt;

  const message = `Ndugu mteja, kiasi cha bili unayodaiwa kwa mwezi ${month} ni Tsh${required_amount}. Deni la nyuma ${debt}. Jumla kuu ${totalBill}. Tafadhali lipa deni lako ndani ya siku 7 kutoka tarehe uliotumiwa ankara kupitia NMB bank akaunti namba 4090250094. Maji ni uhai`;

  try {
    await invoice.save();

    const receiver = {
      recipient_id: 1,
      dest_addr: phone_number,
    };

    // send_sms(message, receiver);
    return res.status(201).json({
      success: 1,
      message: 'invoice created',
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to create new invoice',
      data: null,
    });
  }
};

// TODO: PAY INVOICE HERE
const payInvoice = async (req, res) => {
  let { invoice_id } = req.params;
  const { meter_number, paid_amount, receipt_number } = req.body;

  // return invoice_id;

  try {
    // update invoice
    const pay_invoice = await Invoice.findByIdAndUpdate(
      invoice_id,
      {
        paid_amount: paid_amount,
        receipt_number: receipt_number,
      },
      {
        returnDocument: 'after',
        timestamps: true,
      }
    );

    if (pay_invoice.meter_number) {
      // check if paid amount is equal to required amount
      const { required_amount, debt } = pay_invoice;

      if (required_amount + debt > paid_amount) {
        let new_debt = required_amount + debt - paid_amount;

        // update invoice
        const debt_invoice = await Invoice.findByIdAndUpdate(
          invoice_id,
          {
            paid_amount: paid_amount,
            debt: new_debt,
          },
          {
            returnDocument: 'after',
            timestamps: true,
          }
        );

        return res.status(201).json({
          success: 1,
          message: 'invoices founds',
          data: debt_invoice,
        });
      }

      return res.status(201).json({
        success: 1,
        message: 'invoices founds',
        data: pay_invoice,
      });
    }

    const debt_invoices = await Invoice.find({
      meter_number,
      isComplete: false,
      debt: { $ne: 0 },
    });

    let total_debt = 0;
    // compute total debt with respect to meter_number
    const db = debt_invoices.map(({ past_debt }) => (total_debt += past_debt));

    return res.status(201).json({
      success: 1,
      message: 'invoices founds',
      data: total_debt,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get invoices',
      data: error,
    });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    const invoice = await Invoice.find();
    return res.status(201).json({
      success: 1,
      message: 'invoices found',
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get invoices',
      data: null,
    });
  }
};

const getSingleInvoice = async (req, res) => {
  let id = req.params.id;

  try {
    const invoice = await Invoice.findById(id);
    return res.status(201).json({
      success: 1,
      message: 'invoice found',
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'Fail to get invoice',
      data: null,
    });
  }
};

const updateInvoice = async (req, res) => {
  return res.status(200).json({
    success: 1,
    data: 'Invoice created',
  });
};

const deleteInvoice = async (req, res) => {
  return res.status(200).json({
    success: 1,
    data: 'Invoice created',
  });
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  updateInvoice,
  deleteInvoice,
  payInvoice,
};
