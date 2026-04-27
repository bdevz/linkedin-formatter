export default function OnboardingGuide({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="drawer-shell" onClick={onClose}>
      <div className="drawer guide-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div className="drawer-title">Getting Started</div>
          <button className="x" onClick={onClose}>×</button>
        </div>

        <div className="guide-content">
          <section className="guide-section">
            <h3 className="guide-h">What is this tool?</h3>
            <p className="guide-p">
              LinkedIn Formatter helps you write better LinkedIn posts. You type on the left,
              see exactly how it looks on mobile and desktop in the middle, and get a quality
              score on the right. The goal: posts that hook readers, look great, and drive engagement.
            </p>
          </section>

          <section className="guide-section">
            <h3 className="guide-h">1. Write your post</h3>
            <p className="guide-p">
              Type or paste your LinkedIn post in the big text area on the left side.
              The counter at the top shows your character and word count.
              LinkedIn cuts off posts at 3,000 characters — you'll see a warning if you go over.
            </p>
          </section>

          <section className="guide-section">
            <h3 className="guide-h">2. Check the preview</h3>
            <p className="guide-p">
              The middle column shows exactly how your post will look in the LinkedIn feed —
              both on a phone and on a computer. The dotted line is the <strong>fold</strong> — everything
              below it is hidden until someone taps "...see more". Make sure your first
              1-2 lines are strong enough to make people want to tap.
            </p>
            <p className="guide-p">
              Click "Show expanded view" to see the full post as it appears after someone taps.
            </p>
          </section>

          <section className="guide-section">
            <h3 className="guide-h">3. Improve your score</h3>
            <p className="guide-p">
              The right column shows your <strong>Viral Readiness</strong> score (0-100).
              It checks things like your hook strength, line length, whitespace, and whether
              you have a call-to-action. Each rule shows green, yellow, or red — aim for mostly green.
            </p>
          </section>

          <section className="guide-section">
            <h3 className="guide-h">4. Use hooks</h3>
            <p className="guide-p">
              At the bottom of the editor, open <strong>Hook Library</strong> to browse
              proven opening lines organized by style (personal stakes, contrarian, numbers, etc.).
              Click any hook to prepend it to your post.
            </p>
          </section>

          <section className="guide-section">
            <h3 className="guide-h">5. Save drafts</h3>
            <p className="guide-p">
              Click <strong>Drafts</strong> in the toolbar to save your current post as a draft.
              Name it, and come back to it anytime. Drafts are saved in your browser — they'll
              be there when you return.
            </p>
          </section>

          <section className="guide-section">
            <h3 className="guide-h">6. Inspiration Library</h3>
            <p className="guide-p">
              Click <strong>Inspiration</strong> in the toolbar to save posts from creators you admire.
              Paste their content, tag the platform (LinkedIn, X, podcast, etc.), and add notes
              about what you liked. You can insert inspiration directly into the editor or use
              just the first line as a hook.
            </p>
          </section>

          <section className="guide-section">
            <h3 className="guide-h">7. Best Practices</h3>
            <p className="guide-p">
              Scroll down in the right column (below the score) to find <strong>Best Practices</strong> —
              a reference of LinkedIn tips organized by category: content strategy, formatting,
              hooks, media, algorithm timing, profile optimization, and hashtags. Click any
              category to expand it. You can add your own tips as you learn new things.
            </p>
          </section>

          <section className="guide-section">
            <h3 className="guide-h">8. Set your profile</h3>
            <p className="guide-p">
              Click <strong>Profile</strong> in the toolbar to set your name, headline, and
              photo. This makes the preview look like your actual LinkedIn profile.
            </p>
          </section>

          <section className="guide-section">
            <h3 className="guide-h">9. Copy and post</h3>
            <p className="guide-p">
              When you're happy with your post, click <strong>Copy text</strong>. Then go to
              LinkedIn, start a new post, and paste. The formatting (line breaks, spacing)
              will carry over exactly as you see it in the preview.
            </p>
          </section>

          <section className="guide-section guide-tip-box">
            <h3 className="guide-h">Quick tips</h3>
            <ul className="guide-list">
              <li>Your first line is everything — spend the most time on it</li>
              <li>Keep paragraphs to 1-3 lines for mobile readability</li>
              <li>Always end with a question or call-to-action</li>
              <li>Posts with images or carousels get more engagement</li>
              <li>If a post goes viral, wait 2-3 days before posting again</li>
              <li>Everything saves automatically — just close and come back</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
