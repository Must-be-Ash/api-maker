---
title: Skills
description: 'API for anything - describe what you need in plain text, get a reusable API'
icon: wand-magic-sparkles
---

**Skills** are your API for anything. Describe what you need in plain text, and get a production-ready API endpoint you can call repeatedly.

## Creating Skills


### Via UI (Recommended)

The easiest way to create skills is through the [Cloud Dashboard](https://cloud.browser-use.com/skills). Use **manual mode** to describe exactly what you want, then test and refine until it works perfectly.

<Frame>![Skills Generation Mode](file:3bf22328-e495-4946-a040-c1e74f52da63)</Frame>

1. Go to [cloud.browser-use.com/skills](https://cloud.browser-use.com/skills)
2. Click "Create Skill" and use manual mode
3. Describe your automation goal
4. Wait for it to build and test
5. Execute via UI or API

### Via API

<CodeGroup>

```typescript TypeScript
const skillResponse = await client.skills.createSkill({
    agentPrompt: "Go to hackernews and extract top X posts",
    goal: "Extract top X posts from HackerNews",
});
```

```python Python
skill_response = await client.skills.create_skill(
    agent_prompt="Go to hackernews and extract top X posts",
    goal="Extract top X posts from HackerNews",
)
```

```bash cURL
curl -X POST https://api.browser-use.com/api/v2/skills \
  -H "X-Browser-Use-API-Key: bu_..." \
  -H "Content-Type: application/json" \
  -d '{
    "agentPrompt": "Go to hackernews and extract top X posts",
    "goal": "Extract top X posts from HackerNews"
  }'
```

</CodeGroup>

## Polling Status

Skills build asynchronously. Poll until `finished`:

<CodeGroup>

```typescript TypeScript
let skillStatus = await client.skills.getSkill({ skill_id: skillResponse.id });
while (skillStatus.status !== "finished") {
    await new Promise(resolve => setTimeout(resolve, 2000));
    skillStatus = await client.skills.getSkill({ skill_id: skillResponse.id });
}
```

```python Python
skill_status = await client.skills.get_skill(skill_id=skill_response.id)
while skill_status.status != "finished":
    await asyncio.sleep(2)
    skill_status = await client.skills.get_skill(skill_id=skill_response.id)
```

```bash cURL
curl -X GET https://api.browser-use.com/api/v2/skills/{skill_id} \
  -H "X-Browser-Use-API-Key: bu_..."
```

</CodeGroup>

## Getting Schemas

Once finished, get the parameter and output schemas:

<CodeGroup>

```typescript TypeScript
const skill = await client.skills.getSkill({ skill_id: skillResponse.id });
const parameterSchema = skill.parameters;
const outputSchema = skill.outputSchema;
```

```python Python
skill = await client.skills.get_skill(skill_id=skill_response.id)
parameter_schema = skill.parameters
output_schema = skill.output_schema
```

```bash cURL
curl -X GET https://api.browser-use.com/api/v2/skills/{skill_id} \
  -H "X-Browser-Use-API-Key: bu_..."
```

</CodeGroup>

## Executing Skills

Execute with the required parameters:

<CodeGroup>

```typescript TypeScript
await client.skills.executeSkill({
    skill_id: skill.id,
    parameters: { X: 10 }
});
```

```python Python
await client.skills.execute_skill(
    skill_id=skill.id,
    parameters={"X": 10}
)
```

```bash cURL
curl -X POST https://api.browser-use.com/api/v2/skills/{skill_id}/execute \
  -H "X-Browser-Use-API-Key: bu_..." \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"X": 10}}'
```

</CodeGroup>

## Refining Skills

If execution fails, refine with feedback:

<CodeGroup>

```typescript TypeScript
await client.skills.refineSkill(skill.id, {
    feedback: "Also extract post scores and comment counts"
});
```

```python Python
await client.skills.refine_skill(
    skill.id,
    feedback="Also extract post scores and comment counts"
)
```

```bash cURL
curl -X POST https://api.browser-use.com/api/v2/skills/{skill_id}/refine \
  -H "X-Browser-Use-API-Key: bu_..." \
  -H "Content-Type: application/json" \
  -d '{"feedback": "Also extract post scores and comment counts"}'
```

</CodeGroup>

## Pricing

<Info>
**Generation**: Free  
**Execution**: $0.01 per API call
</Info>
