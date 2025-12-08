import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function MemberDetail() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/members/${id}`)
      .then((res) => setMember(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-xs text-slate-300">Loading...</div>;
  if (!member) return <div className="text-xs text-red-400">Member not found</div>;

  return (
    <div className="space-y-2 text-xs">
      <h1 className="text-xl font-semibold">Member Detail</h1>
      <div className="border border-slate-800 rounded p-3 bg-slate-900">
        <div className="mb-1">
          <span className="font-semibold">Name:</span> {member.fullName}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Gender:</span> {member.gender}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Phone:</span> {member.phone || '-'}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Address:</span> {member.address || '-'}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Ministry:</span> {member.ministry || '-'}
        </div>
        <div className="mb-1">
          <span className="font-semibold">Small Group:</span>{' '}
          {member.smallGroup?.name || '-'}
        </div>
      </div>
    </div>
  );
}