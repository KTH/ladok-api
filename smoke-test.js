require('dotenv').config()
const LadokApi = require('.')
const fs = require('fs')
const ora = require('ora')
const inquirer = require('inquirer')

async function start () {
  console.log('======================')
  console.log('RUNNING THE SMOKE TEST')
  console.log('')
  const s1 = ora('env var BASE_URL').start()
  if (!process.env.BASE_URL) {
    s1.fail('Please set the BASE_URL env file')
    process.exit(1)
  }
  const baseUrl = process.env.BASE_URL
  s1.succeed()

  const s2 = ora('Certificate availability').start()
  let pfx
  try {
    pfx = fs.readFileSync('./certificate.pfx')
  } catch (e) {
    s2.fail('Failed reading file "certificate.pfx"')
    console.error('Please put the "certificate.pfx" file (or a symlink to it) in this project')
    process.exit(1)
  }
  s2.succeed()

  const passphrase = process.env.PASSPHRASE || ''
  const ladok = LadokApi(baseUrl, { pfx, passphrase }, { log: console.log })

  const s3 = ora('Testing /katalog/anvandare endpoint').start()

  let username
  try {
    const result = await ladok.test()
    username = result.body.Anvandarnamn
  } catch (e) {
    if (e.message === 'mac verify failure') {
      s3.fail('Certificate not setup properly. It probably needs a passphrase')
      console.error('Set the env var PASSPHRASE with the passphrase for the certificate')
    } else {
      s3.fail('Error reaching the test endpoint')
      console.error(e)
    }
    process.exit(1)
  }
  s3.succeed()

  const { correct } = await inquirer.prompt({
    name: 'correct',
    message: `Är din Anvandarnamn "${username}"?`,
    type: 'confirm'
  })

  if (!correct) {
    console.error('Your username is not correct. Fix it')
    process.exit(1)
  }

  const { utbildningsinstansUID, kurstillfallenUID } = await inquirer.prompt([
    {
      name: 'utbildningsinstansUID',
      message: 'UTBILDNINGINSTANS_UID',
      default: process.env.UTBILDNINGSINSTANS_UID
    },
    {
      name: 'kurstillfallenUID',
      message: 'KURSTILLFALLEN_UID',
      default: process.env.KURSTILLFALLEN_UID
    }
  ])

  const s4 = ora('Testing sokPaginated with a specific PUT endpoint').start()

  try {
    let iterator = await ladok.sokPaginated(
      `/resultat/studieresultat/rapportera/utbildningsinstans/${utbildningsinstansUID}/sok`,
      {
        KurstillfallenUID: [kurstillfallenUID],
        Filtrering: [
          'OBEHANDLADE',
          'UTKAST',
          'KLARMARKERADE',
          'ATTESTERADE'
        ],
        OrderBy: [
          'EFTERNAMN_ASC',
          'FORNAMN_ASC',
          'PERSONNUMMER_ASC'
        ]
      }
    )

    for await (let page of iterator) {
      if (page) {
        console.log('Getting page one after another...')
      }
    }
  } catch (e) {
    s4.fail('Failure')
    console.error(e.message)
    console.error(e.body)
    process.exit(1)
  }

  s4.succeed()
}

start()
