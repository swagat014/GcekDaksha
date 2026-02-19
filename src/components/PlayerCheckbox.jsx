const PlayerCheckbox = ({ player, checked, onChange }) => {
  return (
    <label className="flex items-center gap-3 border p-2 rounded">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span>{player}</span>
    </label>
  );
};

export default PlayerCheckbox;
