const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");
// CREATE a new section
exports.createSection = async (req, res) => {
	try {
		// Extract the required properties from the request body
		const { sectionName, courseId } = req.body;

		// Log the extracted values after they have been initialized
		console.log('Course ID:', courseId);

		// Validate the input
		if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}

		// Create a new section with the given name
		const newSection = await Section.create({ sectionName });
		console.log('New Section ID:', newSection._id);

		// Find the course and add the new section to its courseContent array
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true } // Option to return the updated document
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();
		console.log('Updated Course:', updatedCourse);

		if (!updatedCourse) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}

		// Return the updated course object in the response
		res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse,
		});

	} catch (error) {
		// Handle errors
		console.error("Error creating section:", error.message); // Log the error for debugging
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};



// UPDATE a section
exports.updateSection = async (req, res) => {
	try {
		const { sectionName, sectionId, courseId } = req.body;
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);

		const course = await Course.findById(courseId)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		res.status(200).json({
			success: true,
			message: section,
			data: course,
		});
	} catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// DELETE a section
exports.deleteSection = async (req, res) => {
	try {

		const { sectionId, courseId } = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if (!section) {
			return res.status(404).json({
				success: false,
				message: "Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({ _id: { $in: section.subSection } });

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path: "courseContent",
			populate: {
				path: "subSection"
			}
		})
			.exec();

		res.status(200).json({
			success: true,
			message: "Section deleted",
			data: course
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};   