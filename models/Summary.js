const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  category: { type: String, required: true },
  deskripsi: { type: String, required: true },
  tanggal: { type: String, required: true },
  nominal: { type: Number, required: true },
});

const SummaryModel = mongoose.model("Summary", summarySchema);
module.exports = SummaryModel;
