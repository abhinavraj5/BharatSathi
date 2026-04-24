const ExpertList = ({ experts, onCall }) => {
  return (
    <div>
      <h3>Available Experts</h3>

      {experts.map((expert) => (
        <div key={expert.id}>
          <p>{expert.name}</p>
          <button onClick={() => onCall(expert)}>Call</button>
        </div>
      ))}
    </div>
  );
};

export default ExpertList;