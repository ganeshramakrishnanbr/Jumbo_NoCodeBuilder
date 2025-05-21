# Prompt Engineering Guidelines

This document outlines the standard format for writing prompts when requesting features, fixes, or enhancements in the Reflexive Questionnaires project.

## Standard Prompt Structure

### 1. CONTEXT
Provide comprehensive background information:

- **System**: Brief description of the relevant system/component
- **Existing Components**: List of related components and their purposes
- **Current Architecture**: Overview of current implementation
- **Current Issues**: List of problems to be addressed (if applicable)
- **Requirements**: Key functionality that must be maintained or added

Example:
```
**System**: UI Designer/Builder application
**Existing Components**:
- Component A (purpose and current state)
- Component B (purpose and current state)
**Current Issues**:
- Issue 1 description
- Issue 2 description
```

### 2. TASK
Clear definition of what needs to be accomplished:

- Main objective in one sentence
- Bullet points for specific requirements
- List of concrete deliverables
- Success criteria

Example:
```
Implement feature X to solve problem Y, ensuring:
1. **Requirement One**: Detailed explanation
2. **Requirement Two**: Detailed explanation

**Specific Objectives**:
- Implementation detail 1
- Implementation detail 2
```

### 3. CONSTRAINTS
Specify all limitations and requirements:

- **Performance**: Response time, memory usage
- **Security**: Authentication, data protection
- **UX**: User interface requirements
- **Compatibility**: Browser support, device support
- **Accessibility**: ARIA compliance, keyboard navigation
- **Code Style**: Must follow project standards (see CODE_STYLE_GUIDELINES.md)

Example:
```
- **Performance**: Must complete within 100ms
- **Security**: Must validate all user inputs
- **Accessibility**: Must support screen readers
```

### 4. EXAMPLES
Provide relevant code examples from the codebase:

- Similar implementations
- Related patterns
- Anti-patterns to avoid
- File locations of relevant code

Example:
```typescript
// Good example from existing codebase
const GoodExample: React.FC = () => {
  const [state, setState] = useState<DataType>();
  // Implementation details
};

// Pattern to avoid
const BadExample: React.FC = () => {
  // Anti-pattern explanation
};
```

### 5. FORMAT
Specify code organization requirements:

- File structure
- Naming conventions
- Documentation requirements
- Testing requirements

Example:
```
1. **File Location**: src/components/feature/
2. **Naming**: PascalCase for components
3. **Testing**: Jest unit tests required
4. **Documentation**: JSDoc comments required
```

### 6. OUTPUT
Define expected deliverables:

- **Code Changes**: List of files to be modified
- **Tests**: Required test coverage
- **Documentation**: Required documentation updates
- **Review Items**: Specific items for code review

Example:
```
1. **Code Deliverables**:
   - New component implementation
   - Updated unit tests
   - Documentation updates

2. **Quality Checklist**:
   - [ ] All tests passing
   - [ ] Documentation complete
   - [ ] Performance requirements met
```

## Sample Prompts

### Feature Implementation
```markdown
## CONTEXT
**System**: Questionnaire Designer
**Existing Components**: [List relevant components]
**Requirements**: [List requirements]

## TASK
Implement [feature] with [specific requirements]...

## CONSTRAINTS
[List constraints]...

## EXAMPLES
[Provide relevant code examples]...

## FORMAT
[Specify code organization]...

## OUTPUT
[Define deliverables]...
```

### Bug Fix
```markdown
## CONTEXT
**System**: [Affected system]
**Issue**: [Bug description]
**Current Behavior**: [What's happening]
**Expected Behavior**: [What should happen]

## TASK
Fix [specific issue]...

## CONSTRAINTS
[List constraints]...

## EXAMPLES
[Provide relevant code examples]...

## OUTPUT
[Define fix verification criteria]...
```

## Best Practices

1. **Be Specific**
   - Provide exact requirements
   - Include acceptance criteria
   - Reference existing code

2. **Include Context**
   - Link to relevant documentation
   - Reference related issues/PRs
   - Explain background decisions

3. **Set Clear Boundaries**
   - Specify what's in/out of scope
   - Define success criteria
   - List known limitations

4. **Provide Examples**
   - Include code snippets
   - Reference similar features
   - Show expected outcomes

5. **Define Quality Requirements**
   - Performance metrics
   - Testing requirements
   - Documentation needs

## Using This Guide

1. **For New Features**:
   - Use the full template
   - Include all sections
   - Provide comprehensive examples

2. **For Bug Fixes**:
   - Focus on CONTEXT and TASK
   - Include steps to reproduce
   - Specify validation criteria

3. **For Enhancements**:
   - Emphasize current limitations
   - Specify improvement metrics
   - Include before/after examples

## Review Process

Before submitting a prompt, verify:

- [ ] All sections are complete
- [ ] Requirements are clear and specific
- [ ] Constraints are well-defined
- [ ] Examples are relevant and correct
- [ ] Success criteria are measurable
- [ ] Quality requirements are specified

---

_Note: This guide should be used in conjunction with PROJECT_NAMING_STANDARDS.md and CODE_STYLE_GUIDELINES.md_
