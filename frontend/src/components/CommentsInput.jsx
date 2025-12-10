/**
 * CommentsInput Component
 *
 * Text area for user comments and special instructions
 */

export function CommentsInput({ value, onChange }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          💬 Comments & Instructions
        </h3>
      </div>
      <div className="card-body">
        <textarea
          placeholder="Add any special instructions, focus areas, or specific details to include in the proposal..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
