import { useEffect, useState } from 'react';
import { apiCallGet } from '../../Utilities/ApiCalls';

export interface FormData {
  id: number;
  impact_project_name: string;
  team: number;
}

export interface GroupedForms {
  [teamId: number]: FormData[];
}

const TeamFormsHelper = () => {
  const [groupedForms, setGroupedForms] = useState<GroupedForms>({});
  const [loading, setLoading] = useState(true);

  // Retrieves forms associated with a team
  useEffect(() => {
    const fetchGroupedForms = async () => {
      try {
        const rawForms = await apiCallGet('api/sdg-action-plan/', true);

        console.log('TeamFormsHelper API Response:', rawForms); // 调试用

        // 确保 rawForms 是一个数组
        let formsArray = [];
        if (Array.isArray(rawForms)) {
          formsArray = rawForms;
        } else if (Array.isArray(rawForms.results)) {
          formsArray = rawForms.results;
        } else if (rawForms.results && typeof rawForms.results === 'object') {
          formsArray = Object.values(rawForms.results).filter(item => 
            item && typeof item === 'object' && 'id' in item
          );
        } else {
          formsArray = [];
        }

        const validForms: FormData[] = formsArray.filter(
          (item: any): item is FormData =>
            item !== null &&
            typeof item === 'object' &&
            'id' in item &&
            'impact_project_name' in item
        );

        const detailedFormPromises = validForms.map(form =>
          apiCallGet(`api/sdg-action-plan/${form.id}/`, true)
        );

        const detailedForms = await Promise.all(detailedFormPromises);

        const grouped: GroupedForms = {};

        detailedForms.forEach(detail => {
          if (detail && detail.team && detail.id) {
            if (!grouped[detail.team]) {
              grouped[detail.team] = [];
            }
            grouped[detail.team].push({
              id: detail.id,
              impact_project_name: detail.impact_project_name,
              team: detail.team
            });
          }
        });

        setGroupedForms(grouped);
      } catch (error) {
        console.error('Failed to load and group forms:', error);
        setGroupedForms({});
      } finally {
        setLoading(false);
      }
    };

    fetchGroupedForms();
  }, []);

  return { groupedForms, loading };
};

export default TeamFormsHelper;