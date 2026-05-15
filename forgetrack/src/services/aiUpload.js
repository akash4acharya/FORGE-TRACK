

const SYSTEM_PROMPT_BASE = `You are an AI that maps column headers from student attendance CSV/Excel files into a normalized database schema.
Allowed target fields: "student_name", "usn", "admission_number", "email", "branch_code", "date", "session_topic", "attendance_status", "IGNORE".
Format agnostic rule: You must map "Candidate", "Name", etc. to "student_name".
Output strictly JSON matching this schema:
{
  "mapping": { "<source_column>": "<target_field>" },
  "date_format": "DD/M/YY" | "DD/MM/YYYY" | "YYYY-MM-DD" | "D-MMM" | "MISSING" | "OTHER",
  "attendance_convention": "TRUE/FALSE" | "P/A" | "Present/Absent" | "1/0" | "Y/N",
  "is_pivoted": boolean,
  "date_columns": ["col1", "col2"]
}

Return ONLY raw, valid JSON. Do not use markdown formatting. Do not wrap the response in \`\`\`json blocks. Start directly with { and end with }.`;

function extractJSON(responseText) {
  const firstBrace = responseText.indexOf('{');
  const lastBrace = responseText.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No valid JSON object found in the AI response.");
  }

  const cleanJson = responseText.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(cleanJson);
  } catch (parseError) {
    console.error("AI JSON Parse Failed. Raw Text Was:", responseText);
    console.error("Cleaned Text Was:", cleanJson);
    throw new Error("Failed to parse JSON from AI: " + parseError.message);
  }
}

async function callViaOpenRouter(systemPrompt, userPrompt, modelName) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "ForgeTrack",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`OpenRouter HTTP ${response.status}:`, errorBody);
    throw new Error(`OpenRouter returned HTTP ${response.status}: ${errorBody.substring(0, 200)}`);
  }

  const data = await response.json();
  console.log("RAW OPENROUTER RESPONSE:", JSON.stringify(data).substring(0, 300));
  return data.choices?.[0]?.message?.content || "";
}

async function callViaGemini(systemPrompt, userPrompt, modelName) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const geminiModel = modelName.replace('google-direct/', '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0 }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Gemini HTTP ${response.status}:`, errorBody);
    throw new Error(`Gemini returned HTTP ${response.status}: ${errorBody.substring(0, 200)}`);
  }

  const data = await response.json();
  console.log("RAW GEMINI RESPONSE:", JSON.stringify(data).substring(0, 300));
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function callGeminiAgent(headers, sampleRows, additionalContext = '', modelName = 'meta-llama/llama-3.3-70b-instruct:free') {
  let systemPrompt = SYSTEM_PROMPT_BASE;

  if (additionalContext) {
    systemPrompt += `\nAdditional Context from User regarding missing dates: "${additionalContext}". Please use this to extrapolate missing dates if necessary by injecting a "date" column mapping or providing an inferred date array.`;
  }

  // Only send the first 3 rows to prevent overload
  const userPrompt = JSON.stringify({
    headers: headers,
    sample_rows: sampleRows.slice(0, 3)
  });

  try {
    let responseText;

    if (modelName.startsWith('google-direct/')) {
      responseText = await callViaGemini(systemPrompt, userPrompt, modelName);
    } else {
      responseText = await callViaOpenRouter(systemPrompt, userPrompt, modelName);
    }

    return extractJSON(responseText);
  } catch (error) {
    console.error("Error calling AI API:", error);
    throw error;
  }
}
