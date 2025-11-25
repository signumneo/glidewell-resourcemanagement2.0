import { DepartmentViewGraph } from '../../components/visualizations/DepartmentViewGraph';

export const DepartmentViewPage = () => {
  console.log('DepartmentViewPage rendered');
  return (
    <div className="w-full h-full">
      <DepartmentViewGraph env="burmes-dev" />
    </div>
  );
};
