import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';
import { Users, Building2, MessageSquare, Rocket, FileText } from 'lucide-react';
import type { GTMICPSchema } from '@/schema/gtm_icp_schema';

interface ICPProfileDisplayProps {
  icpProfile: GTMICPSchema;
}

const ICPProfileDisplay: React.FC<ICPProfileDisplayProps> = ({ icpProfile }) => {
  if (!icpProfile) return null;
  return (
    <div className="space-y-6">
      {/* Personas */}
      {icpProfile.personas && icpProfile.personas.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Buyer Personas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {icpProfile.personas.map((persona, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <h4 className="font-semibold">{persona.title}</h4>
                  <p className="text-sm text-gray-600">{persona.role}</p>
                  {persona.painPoints && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-500">Pain Points:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {persona.painPoints.map((point, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{point}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {persona.responsibilities && persona.responsibilities.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-500">Responsibilities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {persona.responsibilities.map((resp, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{resp}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Firmographics */}
      {icpProfile.firmographics && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Building2 className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Firmographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-medium text-gray-500">Industry</span>
                <p className="text-sm">{icpProfile.firmographics.industry}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Company Size</span>
                <p className="text-sm">{icpProfile.firmographics.companySize}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Revenue Range</span>
                <p className="text-sm">{icpProfile.firmographics.revenueRange}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Region</span>
                <p className="text-sm">{icpProfile.firmographics.region}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messaging Angles */}
      {icpProfile.messagingAngles && icpProfile.messagingAngles.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Messaging Angles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {icpProfile.messagingAngles.map((angle, index) => (
                <Badge key={index} variant="outline">{angle}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* GTM Recommendations */}
      {icpProfile.gtmRecommendations && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Rocket className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">GTM Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 whitespace-pre-line">{icpProfile.gtmRecommendations}</div>
          </CardContent>
        </Card>
      )}

      {/* Competitive Positioning */}
      {icpProfile.competitivePositioning && (
        <Card>
          <CardHeader>
            <CardTitle>Competitive Positioning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 whitespace-pre-line">{icpProfile.competitivePositioning}</div>
          </CardContent>
        </Card>
      )}

      {/* Objection Handling */}
      {icpProfile.objectionHandling && icpProfile.objectionHandling.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Objection Handling</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {icpProfile.objectionHandling.map((obj, i) => <li key={i}>{obj}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Campaign Ideas */}
      {icpProfile.campaignIdeas && icpProfile.campaignIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {icpProfile.campaignIdeas.map((idea, i) => <li key={i}>{idea}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Metrics to Track */}
      {icpProfile.metricsToTrack && icpProfile.metricsToTrack.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Metrics to Track</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {icpProfile.metricsToTrack.map((metric, i) => <li key={i}>{metric}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Film Reviews */}
      {icpProfile.filmReviews && (
        <Card>
          <CardHeader>
            <CardTitle>Film Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 whitespace-pre-line">{icpProfile.filmReviews}</div>
          </CardContent>
        </Card>
      )}

      {/* Cross-Functional Alignment */}
      {icpProfile.crossFunctionalAlignment && (
        <Card>
          <CardHeader>
            <CardTitle>Cross-Functional Alignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 whitespace-pre-line">{icpProfile.crossFunctionalAlignment}</div>
          </CardContent>
        </Card>
      )}

      {/* Demand Gen Framework */}
      {icpProfile.demandGenFramework && (
        <Card>
          <CardHeader>
            <CardTitle>Demand Gen Framework</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 whitespace-pre-line">{icpProfile.demandGenFramework}</div>
          </CardContent>
        </Card>
      )}

      {/* Iterative Measurement */}
      {icpProfile.iterativeMeasurement && (
        <Card>
          <CardHeader>
            <CardTitle>Iterative Measurement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 whitespace-pre-line">{icpProfile.iterativeMeasurement}</div>
          </CardContent>
        </Card>
      )}

      {/* Training & Enablement */}
      {icpProfile.trainingEnablement && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-lg">Training & Enablement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 whitespace-pre-line">{icpProfile.trainingEnablement}</div>
          </CardContent>
        </Card>
      )}

      {/* Apollo Search Params */}
      {icpProfile.apolloSearchParams && (
        <Card>
          <CardHeader>
            <CardTitle>Apollo Search Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-medium text-gray-500">Employee Count</span>
                <p className="text-sm">{icpProfile.apolloSearchParams.employeeCount}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Titles</span>
                <div className="flex flex-wrap gap-1">
                  {icpProfile.apolloSearchParams.titles.map((title, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{title}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Industries</span>
                <div className="flex flex-wrap gap-1">
                  {icpProfile.apolloSearchParams.industries.map((industry, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{industry}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Technologies</span>
                <div className="flex flex-wrap gap-1">
                  {icpProfile.apolloSearchParams.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{tech}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Locations</span>
                <div className="flex flex-wrap gap-1">
                  {icpProfile.apolloSearchParams.locations.map((loc, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{loc}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ICPProfileDisplay; 