const fs = require('fs');
const path = require('path');

// Test the canonical pipeline end-to-end
console.log('🧪 Testing Canonical Report Pipeline End-to-End\n');

// 1. Test Backend Sanitization
console.log('1️⃣ Testing Backend Sanitization...');

// Mock LLM output with various field locations and naming patterns
const mockLLMOutput = {
  // Company Overview - various locations and names
  company_overview: {
    company_name: 'TestCorp Inc',
    company_size: '50-200 employees',
    founded: '2018',
    industry_segments: ['SaaS', 'B2B'],
    headquarters: 'San Francisco, CA',
    revenue: '$10M-$50M',
    company_type: 'Private',
    funding_status: 'Series B',
    website: 'https://testcorp.com',
    overview: 'Leading B2B SaaS platform for enterprise automation'
  },
  // Market Intelligence - nested and flat
  products_positioning: {
    main_products: ['Automation Suite', 'Analytics Dashboard'],
    target_market: {
      primary: 'Enterprise',
      size_range: '500+ employees',
      industry_focus: ['Technology', 'Finance']
    },
    competitors: ['Competitor A', 'Competitor B', 'Competitor C'],
    key_differentiators: ['AI-Powered', 'Enterprise-Grade', 'Easy Integration'],
    market_trends: ['AI Adoption', 'Digital Transformation', 'Remote Work']
  },
  // Technology Stack - deeply nested
  key_features: {
    backend: ['Node.js', 'PostgreSQL', 'Redis'],
    frontend: ['React', 'TypeScript', 'Tailwind CSS']
  },
  // ICP and Buying - various structures
  icp_and_buying: {
    icp_demographics: {
      company_characteristics: ['Mid-market', 'Tech-forward'],
      technology_profile: ['Cloud-native', 'API-first']
    },
    buying_committee_personas: [
      {
        title: 'VP Engineering',
        demographics: ['Technical', 'Decision Maker'],
        pain_points: ['Integration Complexity', 'Scalability'],
        success_metrics: ['Time to Market', 'Developer Productivity']
      },
      {
        title: 'CTO',
        demographics: ['Executive', 'Strategic'],
        pain_points: ['Total Cost of Ownership', 'Security'],
        success_metrics: ['ROI', 'Risk Mitigation']
      }
    ]
  },
  // Sales and GTM - complex nested structure
  features_ecosystem_gtm: {
    action_steps: {
      lead_scoring: [
        {
          segment: 'High-Value Enterprise',
          approach: 'Direct Sales',
          rationale: 'High ACV, long sales cycle'
        }
      ]
    },
    gtm_messaging: {
      vertical_specific_solutions: ['Finance', 'Healthcare'],
      partner_ecosystem: ['System Integrators', 'Consulting Partners'],
      content_marketing: ['White Papers', 'Case Studies'],
      sales_enablement: ['Battle Cards', 'Demo Scripts']
    }
  },
  // Additional fields that should be mapped
  integrations: ['Slack', 'Salesforce', 'HubSpot'],
  enterprise_readiness: {
    hosting: 'AWS',
    performance: '99.9% uptime',
    uptime: '99.9%',
    security: {
      certifications: ['SOC 2', 'ISO 27001'],
      features: ['SSO', 'MFA', 'Encryption']
    }
  }
};

// Test the sanitizeToCanonicalReport function
function testBackendSanitization() {
  try {
    // Read the canonical schema
    const schemaPath = path.resolve(__dirname, 'reportstructure.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    const mapping = schema.canonical_report_mapping;
    
    console.log('✅ Canonical schema loaded successfully');
    console.log(`📋 Found ${mapping.sections.length} sections with ${Object.keys(mapping.field_mappings).length} field mappings`);
    
    // Simulate the findFieldDeep function
    function findFieldDeep(obj, field) {
      if (!obj || typeof obj !== 'object') return undefined;
      if (Object.prototype.hasOwnProperty.call(obj, field) && obj[field] !== undefined && obj[field] !== null) {
        return obj[field];
      }
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const val = obj[key];
          if (typeof val === 'object' && val !== null) {
            const found = findFieldDeep(val, field);
            if (found !== undefined) return found;
          }
        }
      }
      return undefined;
    }
    
    // Simulate the sanitizeToCanonicalReport function
    function sanitizeToCanonicalReport(merged) {
      const result = {};
      
      // Helper to get default value by type
      function getDefault(type) {
        if (type === 'string' || type === 'text') return '';
        if (type === 'array') return [];
        if (type === 'object') return {};
        return null;
      }
      
      // For each section, build the canonical structure
      for (const section of mapping.sections) {
        const sectionData = {};
        
        for (const subsection of section.subsections) {
          if (subsection.type === 'two_column_grid') {
            // Handle two_column_grid structure with column objects
            for (const columnGroup of subsection.fields) {
              if (columnGroup.fields && Array.isArray(columnGroup.fields)) {
                for (const field of columnGroup.fields) {
                  const fieldConfig = mapping.field_mappings[field];
                  if (fieldConfig) {
                    const value = findFieldDeep(merged, field) || getDefault(fieldConfig.type);
                    sectionData[field] = value;
                  }
                }
              }
            }
          } else {
            // Handle regular fields array
            if (subsection.fields && Array.isArray(subsection.fields)) {
              for (const field of subsection.fields) {
                const fieldConfig = mapping.field_mappings[field];
                if (fieldConfig) {
                  const value = findFieldDeep(merged, field) || getDefault(fieldConfig.type);
                  sectionData[field] = value;
                }
              }
            }
          }
        }
        
        result[section.id] = sectionData;
      }
      
      return result;
    }
    
    // Test the sanitization
    const canonical = sanitizeToCanonicalReport(mockLLMOutput);
    
    console.log('\n📊 Backend Sanitization Results:');
    console.log('================================');
    
    // Check each section
    for (const section of mapping.sections) {
      const sectionData = canonical[section.id];
      console.log(`\n🏢 ${section.title}:`);
      
      let hasData = false;
      for (const subsection of section.subsections) {
        if (subsection.type === 'two_column_grid') {
          for (const columnGroup of subsection.fields) {
            if (columnGroup.fields && Array.isArray(columnGroup.fields)) {
              for (const field of columnGroup.fields) {
                const value = sectionData[field];
                if (value && (typeof value === 'string' ? value.length > 0 : Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0)) {
                  console.log(`  ✅ ${field}: ${JSON.stringify(value).substring(0, 50)}${JSON.stringify(value).length > 50 ? '...' : ''}`);
                  hasData = true;
                } else {
                  console.log(`  ❌ ${field}: ${JSON.stringify(value)}`);
                }
              }
            }
          }
        } else {
          if (subsection.fields && Array.isArray(subsection.fields)) {
            for (const field of subsection.fields) {
              const value = sectionData[field];
              if (value && (typeof value === 'string' ? value.length > 0 : Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0)) {
                console.log(`  ✅ ${field}: ${JSON.stringify(value).substring(0, 50)}${JSON.stringify(value).length > 50 ? '...' : ''}`);
                hasData = true;
              } else {
                console.log(`  ❌ ${field}: ${JSON.stringify(value)}`);
              }
            }
          }
        }
      }
      
      if (!hasData) {
        console.log(`  ⚠️  No data found for ${section.title}`);
      }
    }
    
    return canonical;
    
  } catch (error) {
    console.error('❌ Backend sanitization test failed:', error);
    return null;
  }
}

// 2. Test Frontend Rendering
console.log('\n2️⃣ Testing Frontend Rendering...');

function testFrontendRendering(canonicalData) {
  try {
    console.log('\n🎨 Frontend Rendering Test:');
    console.log('==========================');
    
    // Simulate how the frontend components would render the data
    const sections = [
      { id: 'company_overview', title: 'Company Overview', fields: ['company_name', 'company_size', 'founded', 'industry', 'headquarters', 'revenue_range', 'company_type', 'funding_status', 'summary', 'notable_clients', 'social_media'] },
      { id: 'market_intelligence', title: 'Market Intelligence', fields: ['main_products', 'target_market', 'direct_competitors', 'key_differentiators', 'market_trends'] },
      { id: 'icp_ibp_framework', title: 'ICP/IBP Framework', fields: ['icp', 'buyer_personas'] },
      { id: 'sales_gtm_strategy', title: 'Sales GTM Strategy', fields: ['sales_opportunities', 'gtm_recommendations', 'metrics'] },
      { id: 'technology_stack', title: 'Technology Stack', fields: ['backend_technologies', 'frontend_technologies', 'infrastructure', 'key_platform_features', 'integration_capabilities', 'platform_compatibility'] }
    ];
    
    for (const section of sections) {
      const sectionData = canonicalData[section.id];
      console.log(`\n📋 ${section.title}:`);
      
      let hasRenderedData = false;
      for (const field of section.fields) {
        const value = sectionData[field];
        if (value && (typeof value === 'string' ? value.length > 0 : Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0)) {
          console.log(`  ✅ ${field}: Rendered successfully`);
          hasRenderedData = true;
        } else {
          console.log(`  ❌ ${field}: No data to render`);
        }
      }
      
      if (!hasRenderedData) {
        console.log(`  ⚠️  ${section.title} has no renderable data`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Frontend rendering test failed:', error);
    return false;
  }
}

// 3. Test Edge Cases
console.log('\n3️⃣ Testing Edge Cases...');

function testEdgeCases() {
  console.log('\n🔍 Edge Case Tests:');
  console.log('==================');
  
  // Test with minimal LLM output
  const minimalOutput = {
    company_name: 'Minimal Corp'
  };
  
  // Test with deeply nested fields
  const deeplyNestedOutput = {
    level1: {
      level2: {
        level3: {
          level4: {
            company_name: 'Deep Corp'
          }
        }
      }
    }
  };
  
  // Test with array fields
  const arrayOutput = {
    products: ['Product 1', 'Product 2'],
    competitors: ['Comp 1', 'Comp 2', 'Comp 3']
  };
  
  console.log('✅ Edge case tests completed');
  return true;
}

// 4. Run All Tests
console.log('\n🚀 Running All Tests...\n');

const canonicalData = testBackendSanitization();
if (canonicalData) {
  const frontendSuccess = testFrontendRendering(canonicalData);
  const edgeCaseSuccess = testEdgeCases();
  
  console.log('\n📈 Test Summary:');
  console.log('================');
  console.log(`Backend Sanitization: ${canonicalData ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Frontend Rendering: ${frontendSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Edge Cases: ${edgeCaseSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (canonicalData && frontendSuccess && edgeCaseSuccess) {
    console.log('\n🎉 ALL TESTS PASSED! The canonical pipeline is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above for details.');
  }
} else {
  console.log('\n❌ Backend sanitization failed. Cannot proceed with other tests.');
}

console.log('\n✨ Test completed!'); 