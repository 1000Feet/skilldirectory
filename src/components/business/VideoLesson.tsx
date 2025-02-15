
export const VideoLesson = () => {
  return (
    <div className="p-6 bg-white rounded-lg border">
      <h2 className="text-xl font-semibold mb-4 text-[#70B62C]">
        Start with a FREE VIDEO LESSON NOW!
      </h2>
      <div className="relative w-full pt-[56.25%] bg-gray-100 rounded-lg overflow-hidden">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="Free Video Lesson"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};
