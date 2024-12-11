import Interview from "../models/interviewSchema.js";

export const scheduleInterview = async (req, res) => {
  try {
    const { candidateId, jobId, date, location } = req.body;
    const interview = await Interview.create({ candidateId, jobId, date, location });
    res.status(201).json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const interviews = await Interview.find({ candidateId }).populate("jobId", "title");
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
