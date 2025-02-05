import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Table, Button, Space, Tag } from 'antd';
import { CheckCircle, XCircle, Filter, PlayCircle } from 'lucide-react';
import problems from '../../../api/leetcode/scraped_problems.json';

const { Option } = Select;

interface Problem {
  id: string;
  title: string;
  description: string;
  topic: string;
  status?: 'solved' | 'unsolved';
}

const Blind75: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);

  const topics = Array.from(new Set(problems.map((p: Problem) => p.topic)));

  useEffect(() => {
    if (selectedTopic === 'all') {
      setFilteredProblems(problems);
    } else {
      setFilteredProblems(problems.filter((p: Problem) => p.topic === selectedTopic));
    }
  }, [selectedTopic]);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="font-medium text-blue-600">{text}</span>,
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      render: (topic: string) => <Tag color="blue">{topic}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Space>
          {status === 'solved' ? (
            <CheckCircle className="text-green-500" />
          ) : (
            <XCircle className="text-red-500" />
          )}
          <span className={status === 'solved' ? 'text-green-600' : 'text-red-600'}>
            {status ? 'Solved' : 'Unsolved'}
          </span>
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Problem) => (
        <Button 
          type="primary"
          icon={<PlayCircle className="mr-1" />}
          onClick={() => navigate(`/leetcode/blindeditor?id=${record.id}`)}
          className="flex items-center"
        >
          Solve
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8  dark:bg-gray-900 min-h-screen">
      <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Blind 75 Problems</h1>
        <Space>
          <Filter className="text-gray-600 dark:text-gray-300" />
          <span className="text-gray-700 dark:text-gray-300">Filter by Topic:</span>
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={setSelectedTopic}
            className="dark:bg-gray-700 dark:text-gray-100"
          >
            <Option value="all">All Topics</Option>
            {topics.map((topic) => (
              <Option key={topic} value={topic} className="dark:text-gray-100">
                {topic}
              </Option>
            ))}
          </Select>
        </Space>
      </div>
      <div className="bg-transparent dark:bg-gray-800 p-4 rounded-2xl shadow-md">
        <Table 
            columns={columns} 
            dataSource={filteredProblems} 
            rowKey="id"
            pagination={{ pageSize: 15 }}
            className="dark:text-gray-100"
            rowClassName={() => 'border-b border-gray-300 dark:border-gray-700'}
        />
        </div>
    </div>
  );
};

export default Blind75;
