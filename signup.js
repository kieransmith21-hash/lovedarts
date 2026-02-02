const form = document.getElementById("signupForm")

form.addEventListener("submit", handleSignup)

async function handleSignup(event) {
  event.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const username = document.getElementById("username").value

  // 1) Create auth user
  const { data, error } = await window.db.auth.signUp({
    email,
    password
  })

  if (error) {
    console.log("Signup error:", error.message)
    return
  }

  const userId = data.user.id

  // 2) Create profile row
  const { error: profileError } = await window.db
    .from("profiles")
    .insert({
      id: userId,
      username: username
    })

  if (profileError) {
    console.log("Profile insert error:", profileError.message)
    return
  }

  console.log("Signup successful!")
}