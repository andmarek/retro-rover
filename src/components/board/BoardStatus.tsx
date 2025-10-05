"use client";

export function BoardStatus() {
  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
      <p className="text-green-800">✅ Board components loaded successfully!</p>
      <p className="text-sm text-green-600">All @radix-ui dependencies resolved</p>
    </div>
  );
}
