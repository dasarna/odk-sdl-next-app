// components/Projects.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, MapPin } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useDataStore } from '@/lib/stores/useDataStore';
import axios from 'axios';

interface Dataset {
  datasetId: string;
  name: string;
  state: string;
  total: number;
  edited: number;
  rejected: number;
  approved: number;
}

export default function Projects() {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const projects = useDataStore((state) => state.projects);
  const fetchProjects = useDataStore((state) => state.fetchProjects);
  //const submissionCounts = useDataStore((state) => state.submissionCounts);
  //const fetchSubmissionCounts = useDataStore((state) => state.fetchSubmissionCounts);
  const router = useRouter();
  const [datasets, setDatasets] = useState<{ [projectId: number]: Dataset[] }>({});
  const [openProjects, setOpenProjects] = useState<{ [projectId: number]: boolean }>({});
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchAllData = async () => {
      try {
        // Fetch projects first
        await fetchProjects();

        
        // Fetch datasets only if projects are available
        if (projects.length > 0) {
          const newDatasets: { [projectId: number]: Dataset[] } = {};
          for (const project of projects) {
            try {
              const response = await axios.get(`/api/projects/${project.id}/datasets`, {
                headers: { Authorization: `Bearer ${token}` },
              });              

              newDatasets[project.id] = response.data.map((dataset: any) => ({
                datasetId: dataset.xmlFormId,
                name: dataset.name || dataset.xmlFormId,
                state: dataset.state || 'open', // Default to 'open' if undefined
                total: dataset.total || 0,
                edited: dataset.edited || 0,
                rejected: dataset.rejected || 0,
                approved: dataset.approved || 0,
              }));           
              
            } catch (err: any) {
              console.error(`Error fetching datasets for project ${project.id}:`, {
                message: err.message || 'Unknown error',
                status: err.response?.status,
                data: err.response?.data,
              });
              newDatasets[project.id] = [];
            }
          }
          setDatasets(newDatasets);
        }
      } catch (err: any) {
        console.error('Error in fetchAllData:', {
          message: err.message || 'Unknown error',
          status: err.response?.status,
          data: err.response?.data,
        });
      }
    };

    fetchAllData();

    return () => {
      hasFetched.current = false;
    };
  }, [token, router, fetchProjects, projects.length]); // Depend on projects.length

  const handleMapView = (projectId: number, datasetId: string) => {
    router.push(`/projects/${projectId}/datasets/${datasetId}/map`);
  };

  const toggleCollapsible = (projectId: number) => {
    setOpenProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  return (
    <div className="p-4">      
      <h2 className="text-2xl mt-4 font-bold">Assigned Projects:</h2>
      {projects.length === 0 ? (
        <div>Loading projects...</div>
      ) : (
        projects.map((project) => (
          <Card key={project.id} className="mt-4">
            <CardHeader>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <p>Project ID: {project.id}</p>
            </CardHeader>
            <CardContent>
              <Collapsible
                open={openProjects[project.id] || false}
                onOpenChange={() => toggleCollapsible(project.id)}
              >
                <CollapsibleTrigger className="flex text-sm pb-3">
                  Toggle Forms
                  <ChevronDown
                    className={`h-5 w-5 transform transition-transform duration-300 ${openProjects[project.id] ? 'rotate-180' : 'rotate-0'
                      }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {datasets[project.id]?.length ? (
                    <div className="min-h-0 w-full mx-auto overflow-y-auto grid grid-cols-1 gap-2 md:gap-4 lg:grid-cols-2 xl:grid-cols-3 pb-6">
                      {datasets[project.id]
                        .filter((dataset) => dataset.state === 'open')
                        .map((dataset) => (
                          <div
                            key={dataset.datasetId}
                            data-sentry-element="PrefetchableLink"
                            data-sentry-source-file="project.$ref.tsx"
                            className="group relative text-left bg-surface-100 border border-surface rounded-md p-5 flex flex-row transition ease-in-out duration-150 cursor-pointer hover:bg-surface-200 hover:border-control min-h-32 md:min-h-44 h-44 !px-0 pt-5 pb-0"
                            data-sentry-component="ProjectIndexPageLink"
                            onClick={() => handleMapView(project.id, dataset.datasetId)}
                          >
                            <div className="flex h-full w-full flex-col space-y-2">
                              <div className="w-full justify-between space-y-1.5 px-5">
                                <p className="flex-shrink truncate text-sm pr-4 font-bold">{dataset.name}</p>
                                <span className="text-sm text-foreground-light">{dataset.datasetId}</span>
                                <br/><br/>
                                <span className="text-xs text-foreground-light">T:{dataset.total} | 
                                  A:{dataset.approved} | 
                                  E:{dataset.edited} | 
                                  R:{dataset.rejected} | 
                                  V:{dataset.total - dataset.rejected}
                                </span>
                                <div className="flex items-center gap-x-1.5"></div>
                              </div>
                              <div className="w-full !mt-auto"></div>
                            </div>
                            <div className="absolute right-4 top-4 text-foreground-lighter transition-all duration-200 group-hover:right-3 group-hover:text-foreground">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-right"
                              >
                                <path d="m9 18 6-6-6-6"></path>
                              </svg>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p>No open forms available</p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
