import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

const CreationItem = ({ item }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h2 className="font-medium">{item.prompt}</h2>
                    <p className="text-gray-600">
                        {item.type} - {new Date(item.created_at).toLocaleDateString()}
                    </p>
                </div>
                <button
                    onClick={() => setExpanded((prev) => !prev)}
                    className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full cursor-pointer"
                >
                    {expanded ? "Hide" : "View"} {item.type}
                </button>
            </div>

            {expanded && (
                <div className="mt-3">
                    {item.type === "image" ? (
                        <img
                            src={item.content}
                            alt="image"
                            className="w-full max-w-md rounded"
                        />
                    ) : (
                        <div className="reset-tw">
                            <ReactMarkdown>{item.content}</ReactMarkdown>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreationItem;
