// Quick script to fix PMJJBY URL in Supabase
// Run this in browser console on famledgerai.com

async function fixPMJJBYUrl() {
    const SUPABASE_URL = 'https://yfxqrjccqhqjqvvxqxqo.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeHFyamNjcWhxanF2dnhxeHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5NzY1NzcsImV4cCI6MjA1MzU1MjU3N30.Ql_2Ks-Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0';
    
    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Update PMJJBY URL
    const { data, error } = await sb
        .from('schemes')
        .update({ 
            official_url: 'https://www.india.gov.in/spotlight/pradhan-mantri-jeevan-jyoti-bima-yojana'
        })
        .eq('name', 'Pradhan Mantri Jeevan Jyoti Bima Yojana')
        .select();
    
    if (error) {
        console.error('Error updating PMJJBY URL:', error);
    } else {
        console.log('Successfully updated PMJJBY URL:', data);
    }
    
    // Also update PMSBY if it has the same issue
    const { data: data2, error: error2 } = await sb
        .from('schemes')
        .update({ 
            official_url: 'https://www.india.gov.in/spotlight/pradhan-mantri-suraksha-bima-yojana'
        })
        .eq('name', 'Pradhan Mantri Suraksha Bima Yojana')
        .select();
    
    if (error2) {
        console.error('Error updating PMSBY URL:', error2);
    } else {
        console.log('Successfully updated PMSBY URL:', data2);
    }
}

// Run the fix
fixPMJJBYUrl();
